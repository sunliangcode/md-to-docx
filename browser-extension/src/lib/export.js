(function (global) {
  const DEFAULTS = {
    endpoint: "http://127.0.0.1:8080",
    preset: "technical",
    numbering: false,
    fallbackMd: true,
    showFloating: true,
  };

  function t(key, vars) {
    if (global.MdToDocxI18n && typeof global.MdToDocxI18n.t === "function") {
      return global.MdToDocxI18n.t(key, vars);
    }
    return key;
  }

  function isLoopbackEndpoint(url) {
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") return false;
      const host = (u.hostname || "").toLowerCase();
      return (
        host === "127.0.0.1" ||
        host === "localhost" ||
        host === "[::1]" ||
        host === "::1"
      );
    } catch (_) {
      return false;
    }
  }

  function sanitizeEndpoint(url) {
    const raw = String(url || DEFAULTS.endpoint).replace(/\/$/, "");
    return isLoopbackEndpoint(raw) ? raw : DEFAULTS.endpoint;
  }

  const PROBE_TTL_MS = 30000;
  const DRAG_THRESHOLD = 4;

  let probeCache = { at: 0, online: false, endpoint: "" };
  const trackedButtons = new Set();

  function positionToastNearAnchor(el, anchor) {
    const pad = 8;
    const gap = 12;
    let rect = null;
    if (anchor && anchor.getBoundingClientRect) {
      rect = anchor.getBoundingClientRect();
    } else {
      const float = document.querySelector(".md-to-docx-float");
      if (float) rect = float.getBoundingClientRect();
    }
    if (!rect) {
      el.style.left = "";
      el.style.top = "";
      el.style.right = "24px";
      el.style.bottom = "80px";
      return;
    }

    // Measure after append so offsetWidth/Height are available
    const tw = el.offsetWidth || 280;
    const th = el.offsetHeight || 48;
    let left = rect.right - tw;
    let top = rect.top - th - gap;
    if (top < pad) top = rect.bottom + gap;
    left = Math.min(Math.max(pad, left), window.innerWidth - tw - pad);
    top = Math.min(Math.max(pad, top), window.innerHeight - th - pad);
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.left = left + "px";
    el.style.top = top + "px";
  }

  function showToast(message, anchor, kind) {
    const existing = document.querySelector(".md-to-docx-toast");
    if (existing) existing.remove();
    const el = document.createElement("div");
    const tone = kind === "ok" || kind === "err" ? kind : "info";
    el.className = "md-to-docx-toast md-to-docx-toast--" + tone;
    el.setAttribute("role", tone === "err" ? "alert" : "status");
    el.setAttribute("aria-live", tone === "err" ? "assertive" : "polite");
    el.textContent = message;
    el.style.cursor = "pointer";
    el.title = t("dismiss");
    el.addEventListener("click", () => {
      el.classList.remove("md-to-docx-toast--visible");
      el.classList.add("md-to-docx-toast--leaving");
      setTimeout(() => el.remove(), 220);
    });
    document.body.appendChild(el);
    positionToastNearAnchor(el, anchor && anchor.getBoundingClientRect ? anchor : null);
    requestAnimationFrame(() => {
      el.classList.add("md-to-docx-toast--visible");
    });
    setTimeout(() => {
      el.classList.remove("md-to-docx-toast--visible");
      el.classList.add("md-to-docx-toast--leaving");
      setTimeout(() => el.remove(), 220);
    }, 5600);
  }

  function showToastKey(key, kind, vars) {
    showToast(t(key, vars), null, kind || "err");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function downloadText(text, filename) {
    downloadBlob(new Blob([text], { type: "text/markdown" }), filename);
  }

  function isExtensionAlive() {
    try {
      return !!(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id);
    } catch (_) {
      return false;
    }
  }

  function isContextError(err) {
    const msg = String((err && err.message) || err || "");
    return /invalidated|extension context/i.test(msg);
  }

  function lastErrorIsContext() {
    try {
      const err = chrome.runtime && chrome.runtime.lastError;
      return err && isContextError(err);
    } catch (_) {
      return true;
    }
  }

  function removeStaleFloatUi() {
    try {
      document.querySelectorAll(".md-to-docx-float").forEach((el) => el.remove());
    } catch (_) {}
  }

  function handleDeadContext(toastMsg, kind) {
    removeStaleFloatUi();
    showToast(toastMsg || t("extUpdated"), null, kind || "err");
  }

  async function getSettings() {
    if (!isExtensionAlive()) {
      return { ...DEFAULTS };
    }
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(DEFAULTS, (items) => {
          if (lastErrorIsContext()) {
            resolve({ ...DEFAULTS });
            return;
          }
          const merged = { ...DEFAULTS, ...(items || {}) };
          merged.endpoint = sanitizeEndpoint(merged.endpoint);
          resolve(merged);
        });
      } catch (err) {
        if (isContextError(err)) {
          resolve({ ...DEFAULTS });
          return;
        }
        resolve({ ...DEFAULTS });
      }
    });
  }

  function storageLocalGet(keys) {
    if (!isExtensionAlive()) return Promise.resolve({});
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(keys, (items) => {
          if (lastErrorIsContext()) {
            resolve({});
            return;
          }
          resolve(items || {});
        });
      } catch (_) {
        resolve({});
      }
    });
  }

  function storageLocalSet(obj) {
    if (!isExtensionAlive()) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set(obj, () => {
          lastErrorIsContext();
          resolve();
        });
      } catch (_) {
        resolve();
      }
    });
  }

  function storageSyncSet(obj) {
    if (!isExtensionAlive()) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.set(obj, () => {
          lastErrorIsContext();
          resolve();
        });
      } catch (_) {
        resolve();
      }
    });
  }

  function exportLabel(online) {
    return online ? t("labelWord") : t("labelMd");
  }

  function exportHint(online) {
    return online ? t("hintOnline") : t("hintOffline");
  }

  function createCloseSvg() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "md-to-docx-float-svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M18 6L6 18M6 6l12 12");
    svg.appendChild(path);
    return svg;
  }

  function createMdBadge() {
    const badge = document.createElement("span");
    badge.className = "md-to-docx-md-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "MD";
    return badge;
  }

  function getFocusable(root) {
    if (!root) return [];
    return Array.prototype.slice
      .call(
        root.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true";
      });
  }

  function trapFocus(root, e) {
    const items = getFocusable(root);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function focusFirst(root) {
    const items = getFocusable(root);
    if (!items.length) return;
    try {
      items[0].focus();
    } catch (_) {}
  }

  function restoreFocus(el, fallback) {
    const target = el && typeof el.focus === "function" ? el : fallback;
    if (!target || typeof target.focus !== "function") return;
    try {
      target.focus();
    } catch (_) {}
  }

  function setExportBusy(busy) {
    const on = !!busy;
    trackedButtons.forEach(function (btn) {
      if (!btn || !btn.isConnected) return;
      btn.disabled = on;
      btn.setAttribute("aria-busy", on ? "true" : "false");
      btn.classList.toggle("md-to-docx-export-btn--busy", on);
      if (on) {
        if (!btn.dataset.mdIdleLabel) {
          const labelEl = btn.querySelector(".md-to-docx-float-label, .md-to-docx-btn-label");
          btn.dataset.mdIdleLabel = labelEl ? labelEl.textContent : btn.textContent || "";
        }
        setButtonLabel(btn, t("exporting"));
      } else if (btn.dataset.mdIdleLabel) {
        setButtonLabel(btn, btn.dataset.mdIdleLabel);
        delete btn.dataset.mdIdleLabel;
      }
    });
    if (!on) {
      probeEndpoint(false).catch(function () {});
    }
  }

  function setButtonLabel(btn, label) {
    const labelEl = btn.querySelector(".md-to-docx-float-label, .md-to-docx-btn-label");
    if (labelEl) {
      labelEl.textContent = label;
    } else {
      btn.textContent = label;
    }
  }

  function updateFloatChrome(online) {
    const wrap = document.querySelector(".md-to-docx-float");
    if (!wrap) return;
    const status = wrap.querySelector(".md-to-docx-float-status");
    if (status) {
      status.dataset.online = online ? "1" : "0";
      status.title = online ? t("statusOnline") : t("statusOffline");
    }
    const hint = wrap.querySelector(".md-to-docx-float-hint");
    if (hint) hint.textContent = exportHint(online);
    const launcher = wrap.querySelector(".md-to-docx-float-launcher");
    if (launcher) {
      const tip = t("dragToMove", { label: exportLabel(online) });
      launcher.title = tip;
      launcher.setAttribute("aria-label", tip);
    }
    const title = wrap.querySelector(".md-to-docx-float-sheet-title");
    if (title) title.textContent = t("exportTitle");
    const close = wrap.querySelector(".md-to-docx-float-sheet-close");
    if (close) {
      close.setAttribute("aria-label", t("close"));
      close.title = t("close");
    }
    const sheet = wrap.querySelector(".md-to-docx-float-sheet");
    if (sheet) sheet.setAttribute("aria-label", t("exportTitle"));
  }

  function refreshTrackedLabels(online) {
    const label = exportLabel(online);
    trackedButtons.forEach((btn) => {
      if (btn && btn.isConnected) {
        setButtonLabel(btn, label);
        btn.dataset.mdToDocxMode = online ? "word" : "md";
      }
    });
    updateFloatChrome(online);
  }

  async function probeEndpoint(force) {
    const settings = await getSettings();
    const endpoint = (settings.endpoint || DEFAULTS.endpoint).replace(/\/$/, "");
    const now = Date.now();
    if (
      !force &&
      probeCache.endpoint === endpoint &&
      now - probeCache.at < PROBE_TTL_MS
    ) {
      refreshTrackedLabels(probeCache.online);
      return probeCache.online;
    }

    let online = false;
    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 2500) : null;
      const res = await fetch(endpoint + "/healthz", {
        method: "GET",
        signal: controller ? controller.signal : undefined,
      });
      if (timer) clearTimeout(timer);
      online = res.ok;
    } catch (_) {
      online = false;
    }

    probeCache = { at: now, online, endpoint };
    refreshTrackedLabels(online);
    return online;
  }

  function trackButton(btn) {
    trackedButtons.add(btn);
    probeEndpoint(false)
      .then((online) => {
        if (!btn || !btn.isConnected) return;
        setButtonLabel(btn, exportLabel(online));
        btn.dataset.mdToDocxMode = online ? "word" : "md";
        updateFloatChrome(online);
      })
      .catch(() => {});
  }

  async function convertAndDownload(markdown, title) {
    setExportBusy(true);
    try {
      await convertAndDownloadInner(markdown, title);
    } finally {
      setExportBusy(false);
    }
  }

  async function convertAndDownloadInner(markdown, title) {
    const safeTitle = global.MdToDocxExtract.sanitizeTitle(title);
    let settings = { ...DEFAULTS };
    let dead = !isExtensionAlive();

    try {
      settings = await getSettings();
    } catch (err) {
      if (isContextError(err)) dead = true;
    }

    if (dead || !isExtensionAlive()) {
      if (settings.fallbackMd !== false) {
        downloadText(markdown, safeTitle + ".md");
        handleDeadContext(
          t("downloadedMdUpdated", { file: safeTitle + ".md" }),
          "info"
        );
      } else {
        handleDeadContext();
      }
      return;
    }

    const endpoint = settings.endpoint.replace(/\/$/, "");
    let online = false;
    try {
      online = await probeEndpoint(true);
    } catch (err) {
      if (isContextError(err)) {
        downloadText(markdown, safeTitle + ".md");
        handleDeadContext(
          t("downloadedMdUpdated", { file: safeTitle + ".md" }),
          "info"
        );
        return;
      }
      online = false;
    }

    if (!online) {
      if (settings.fallbackMd) {
        downloadText(markdown, safeTitle + ".md");
        showToast(t("downloadedMdOffline", { file: safeTitle + ".md" }), null, "info");
      } else {
        showToast(t("offlineEnableFallback"), null, "err");
      }
      return;
    }

    try {
      const res = await fetch(endpoint + "/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          preset: settings.preset,
          // Omit toc so Playground/API follow the preset default.
          numbering: !!settings.numbering,
        }),
      });

      if (!res.ok) {
        let detail = t("exportFailed");
        try {
          const json = await res.json();
          detail = json.detail?.problem || json.detail?.cause || JSON.stringify(json.detail);
        } catch (_) {
          detail = res.statusText;
        }
        throw new Error(detail);
      }

      const blob = await res.blob();
      downloadBlob(blob, safeTitle + ".docx");
      showToast(t("downloadedDocx", { file: safeTitle + ".docx" }), null, "ok");
      refreshTrackedLabels(true);
    } catch (err) {
      if (isContextError(err)) {
        downloadText(markdown, safeTitle + ".md");
        handleDeadContext(
          t("downloadedMdUpdated", { file: safeTitle + ".md" }),
          "info"
        );
        return;
      }
      probeCache = { at: Date.now(), online: false, endpoint };
      refreshTrackedLabels(false);
      if (settings.fallbackMd) {
        downloadText(markdown, safeTitle + ".md");
        showToast(t("downloadedMdHint", { file: safeTitle + ".md" }), null, "info");
      } else {
        showToast(err.message || t("exportFailed"), null, "err");
      }
    }
  }

  function injectExportButton(container, onClick) {
    if (!container || container.querySelector(".md-to-docx-export-btn")) return null;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "md-to-docx-export-btn";

    const label = document.createElement("span");
    label.className = "md-to-docx-btn-label";
    label.textContent = t("labelWord");

    btn.appendChild(createMdBadge());
    btn.appendChild(label);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
    container.appendChild(btn);
    trackButton(btn);
    return btn;
  }

  function clampFloatPosition(wrap, left, top) {
    const pad = 8;
    const w = wrap.offsetWidth || 48;
    const h = wrap.offsetHeight || 48;
    const maxL = Math.max(pad, window.innerWidth - w - pad);
    const maxT = Math.max(pad, window.innerHeight - h - pad);
    return {
      left: Math.min(Math.max(pad, left), maxL),
      top: Math.min(Math.max(pad, top), maxT),
    };
  }

  function applyFloatPosition(wrap, pos) {
    if (!pos || typeof pos.left !== "number" || typeof pos.top !== "number") {
      wrap.style.left = "";
      wrap.style.top = "";
      wrap.style.right = "20px";
      wrap.style.bottom = "20px";
      return;
    }
    const clamped = clampFloatPosition(wrap, pos.left, pos.top);
    wrap.style.right = "auto";
    wrap.style.bottom = "auto";
    wrap.style.left = clamped.left + "px";
    wrap.style.top = clamped.top + "px";
  }

  function positionFloatSheet(wrap) {
    const sheet = wrap.querySelector(".md-to-docx-float-sheet");
    const launcher = wrap.querySelector(".md-to-docx-float-launcher");
    if (!sheet || !launcher) return;
    sheet.classList.remove("md-to-docx-float-sheet-below");
    const rect = launcher.getBoundingClientRect();
    const sheetH = sheet.offsetHeight || 120;
    const gap = 12;
    const pad = 8;
    if (rect.top - sheetH - gap < pad) {
      sheet.classList.add("md-to-docx-float-sheet-below");
    }
  }

  function setFloatOpen(wrap, open) {
    const isOpen = !!open;
    const wasOpen = wrap.classList.contains("md-to-docx-float-open");
    wrap.classList.toggle("md-to-docx-float-open", isOpen);
    const launcher = wrap.querySelector(".md-to-docx-float-launcher");
    const sheet = wrap.querySelector(".md-to-docx-float-sheet");
    if (launcher) launcher.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      if (!wasOpen) wrap._mdPrevFocus = document.activeElement;
      positionFloatSheet(wrap);
      if (sheet) {
        requestAnimationFrame(function () {
          focusFirst(sheet);
        });
      }
    } else if (wasOpen) {
      const prev = wrap._mdPrevFocus;
      wrap._mdPrevFocus = null;
      restoreFocus(prev, launcher);
    }
  }

  function enableFloatDrag(wrap, onDragStart) {
    let pending = false;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let origL = 0;
    let origT = 0;
    let activePointerId = null;

    wrap.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (!e.target.closest(".md-to-docx-float-launcher")) return;
      if (e.target.closest(".md-to-docx-float-sheet")) return;
      const rect = wrap.getBoundingClientRect();
      pending = true;
      dragging = false;
      moved = false;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      origL = rect.left;
      origT = rect.top;
    });

    wrap.addEventListener("pointermove", (e) => {
      if (!pending && !dragging) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragging = true;
        moved = true;
        wrap.classList.add("md-to-docx-float-dragging");
        if (typeof onDragStart === "function") onDragStart();
        try {
          wrap.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      const next = clampFloatPosition(wrap, origL + dx, origT + dy);
      wrap.style.right = "auto";
      wrap.style.bottom = "auto";
      wrap.style.left = next.left + "px";
      wrap.style.top = next.top + "px";
    });

    function endDrag(e) {
      if (!pending && !dragging) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      const wasDragging = dragging;
      pending = false;
      dragging = false;
      activePointerId = null;
      wrap.classList.remove("md-to-docx-float-dragging");
      if (wasDragging) {
        try {
          wrap.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      if (moved) {
        const rect = wrap.getBoundingClientRect();
        const pos = clampFloatPosition(wrap, rect.left, rect.top);
        applyFloatPosition(wrap, pos);
        storageLocalSet({ floatPos: pos }).catch(() => {});
        wrap.dataset.dragged = "1";
        setTimeout(() => {
          delete wrap.dataset.dragged;
        }, 0);
      }
    }

    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
  }

  function injectFloatingButton(onClick, options) {
    const opts = options || {};
    const existing = document.querySelector(".md-to-docx-float");
    if (existing) {
      const action = existing.querySelector(".md-to-docx-float-action");
      if (action && !trackedButtons.has(action)) trackButton(action);
      return action || existing;
    }

    let wrap;
    let action;
    let allowShow = true;
    let remountTimer = null;
    let remountObserver = null;
    let remountHandle = null;

    try {
      wrap = document.createElement("div");
      wrap.className = "md-to-docx-float";
      wrap.style.display = "none";

      const launcher = document.createElement("button");
      launcher.type = "button";
      launcher.className = "md-to-docx-float-launcher";
      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-haspopup", "dialog");
      const tip = t("dragToMove", { label: t("labelWord") });
      launcher.title = tip;
      launcher.setAttribute("aria-label", tip);
      launcher.appendChild(createMdBadge());

      const status = document.createElement("span");
      status.className = "md-to-docx-float-status";
      status.dataset.online = "0";
      status.setAttribute("aria-hidden", "true");
      launcher.appendChild(status);

      const sheet = document.createElement("div");
      sheet.className = "md-to-docx-float-sheet";
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-modal", "true");
      sheet.setAttribute("aria-label", t("exportTitle"));

      const header = document.createElement("div");
      header.className = "md-to-docx-float-sheet-header";

      const title = document.createElement("span");
      title.className = "md-to-docx-float-sheet-title";
      title.id = "md-to-docx-float-sheet-title";
      title.textContent = t("exportTitle");

      const close = document.createElement("button");
      close.type = "button";
      close.className = "md-to-docx-float-sheet-close";
      close.setAttribute("aria-label", t("close"));
      close.title = t("close");
      close.appendChild(createCloseSvg());

      header.appendChild(title);
      header.appendChild(close);

      action = document.createElement("button");
      action.type = "button";
      action.className = "md-to-docx-export-btn md-to-docx-float-action";

      const actionLabel = document.createElement("span");
      actionLabel.className = "md-to-docx-float-label";
      actionLabel.textContent = t("labelWord");

      action.appendChild(createMdBadge());
      action.appendChild(actionLabel);

      const hint = document.createElement("p");
      hint.className = "md-to-docx-float-hint";
      hint.textContent = exportHint(false);

      sheet.setAttribute("aria-labelledby", title.id);
      sheet.appendChild(header);
      sheet.appendChild(action);
      sheet.appendChild(hint);

      wrap.appendChild(launcher);
      wrap.appendChild(sheet);

      function closeSheet() {
        setFloatOpen(wrap, false);
      }

      function toggleSheet() {
        setFloatOpen(wrap, !wrap.classList.contains("md-to-docx-float-open"));
      }

      launcher.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (wrap.dataset.dragged === "1") return;
        toggleSheet();
      });

      close.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSheet();
      });

      action.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSheet();
        onClick();
      });

      function onDocPointerDown(e) {
        if (!wrap.classList.contains("md-to-docx-float-open")) return;
        if (wrap.contains(e.target)) return;
        closeSheet();
      }

      function onDocKeyDown(e) {
        if (!wrap.classList.contains("md-to-docx-float-open")) return;
        if (e.key === "Escape") {
          e.preventDefault();
          closeSheet();
          return;
        }
        if (e.key === "Tab") {
          const openSheet = wrap.querySelector(".md-to-docx-float-sheet");
          if (openSheet) trapFocus(openSheet, e);
        }
      }

      document.addEventListener("pointerdown", onDocPointerDown, true);
      document.addEventListener("keydown", onDocKeyDown, true);

      enableFloatDrag(wrap, closeSheet);
    } catch (_) {
      return null;
    }

    function remountIfDetached() {
      if (!allowShow || !wrap || !document.body) return;
      if (wrap.isConnected) return;
      if (document.querySelector(".md-to-docx-float")) return;
      const remount = () => {
        try {
          document.body.appendChild(wrap);
        } catch (_) {}
      };
      if (remountHandle && typeof remountHandle.runQuiet === "function") {
        remountHandle.runQuiet(remount);
      } else {
        remount();
      }
    }

    function scheduleRemountCheck() {
      if (remountTimer != null) return;
      remountTimer = setTimeout(() => {
        remountTimer = null;
        remountIfDetached();
      }, 80);
    }

    function ensureRemountObserver() {
      if (remountObserver || remountHandle) return;
      if (global.MdToDocxObserve && typeof global.MdToDocxObserve.watch === "function") {
        try {
          remountHandle = global.MdToDocxObserve.watch(
            document.documentElement,
            () => {
              if (!allowShow) return;
              if (wrap && !wrap.isConnected) scheduleRemountCheck();
            },
            { debounceMs: 80 }
          );
          remountObserver = remountHandle;
          return;
        } catch (_) {
          remountHandle = null;
        }
      }
      if (typeof MutationObserver === "undefined") return;
      try {
        remountObserver = new MutationObserver((mutations) => {
          if (!allowShow) return;
          if (
            global.MdToDocxObserve &&
            global.MdToDocxObserve.shouldIgnoreMutations(mutations)
          ) {
            return;
          }
          if (wrap && !wrap.isConnected) scheduleRemountCheck();
        });
        remountObserver.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      } catch (_) {
        remountObserver = null;
      }
    }

    function mount() {
      try {
        if (!document.body) return;
        if (document.querySelector(".md-to-docx-float")) return;
        document.body.appendChild(wrap);
        trackButton(action);
        ensureRemountObserver();
        storageLocalGet(["floatPos"])
          .then((items) => {
            applyFloatPosition(wrap, items.floatPos);
          })
          .catch(() => {});
      } catch (_) {}
    }

    getSettings()
      .then((settings) => {
        if (opts.requireSetting !== false && settings.showFloating === false) {
          allowShow = false;
          return;
        }
        allowShow = true;
        wrap.style.display = "";
        if (document.body) mount();
        else document.addEventListener("DOMContentLoaded", mount, { once: true });
      })
      .catch(() => {});

    return action;
  }

  if (typeof document !== "undefined") {
    setTimeout(() => {
      probeEndpoint(false).catch(() => {});
    }, 0);
  }

  if (global.MdToDocxI18n && typeof global.MdToDocxI18n.onLocaleChange === "function") {
    global.MdToDocxI18n.onLocaleChange(() => {
      probeEndpoint(false).catch(() => {});
    });
  }

  global.MdToDocxExport = {
    convertAndDownload,
    injectExportButton,
    injectFloatingButton,
    showToast,
    showToastKey,
    probeEndpoint,
    getSettings,
    isExtensionAlive,
    exportLabel,
    setExportBusy,
    trapFocus,
    focusFirst,
    restoreFocus,
    get LABEL_WORD() {
      return t("labelWord");
    },
    get LABEL_MD() {
      return t("labelMd");
    },
    DEFAULTS,
  };
})(typeof window !== "undefined" ? window : globalThis);
