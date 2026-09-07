(function (global) {
  const FLOAT_CLASS = "md-to-docx-batch-float";
  const PANEL_CLASS = "md-to-docx-batch-panel";
  const BACKDROP_CLASS = "md-to-docx-batch-backdrop";
  const DRAG_THRESHOLD = 4;
  const SELECTED = new Map(); // id -> { id, title, el, anchor }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function waitFor(predicate, timeoutMs, intervalMs) {
    const timeout = timeoutMs || 8000;
    const interval = intervalMs || 200;
    const start = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        try {
          if (predicate()) {
            resolve(true);
            return;
          }
        } catch (_) {}
        if (Date.now() - start >= timeout) {
          resolve(false);
          return;
        }
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function isExtensionAlive() {
    try {
      return !!(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id);
    } catch (_) {
      return false;
    }
  }

  function storageLocalGet(keys) {
    if (!isExtensionAlive()) return Promise.resolve({});
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(keys, (items) => {
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
        chrome.storage.local.set(obj, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  function createBatchBadge() {
    const badge = createEl("span", "md-to-docx-md-badge");
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "B";
    return badge;
  }

  function createCloseIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "md-to-docx-float-svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 24 24");
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
      wrap.style.left = "20px";
      wrap.style.top = "";
      wrap.style.right = "auto";
      wrap.style.bottom = "20px";
      return;
    }
    const clamped = clampFloatPosition(wrap, pos.left, pos.top);
    wrap.style.right = "auto";
    wrap.style.bottom = "auto";
    wrap.style.left = clamped.left + "px";
    wrap.style.top = clamped.top + "px";
  }

  function positionBatchSheet(wrap) {
    const sheet = wrap.querySelector(".md-to-docx-batch-sheet");
    const launcher = wrap.querySelector(".md-to-docx-batch-launcher");
    if (!sheet || !launcher) return;
    sheet.classList.remove("md-to-docx-batch-sheet-below");
    const rect = launcher.getBoundingClientRect();
    const sheetH = sheet.offsetHeight || 180;
    const gap = 12;
    const pad = 8;
    if (rect.top - sheetH - gap < pad) {
      sheet.classList.add("md-to-docx-batch-sheet-below");
    }
  }

  function setFloatOpen(wrap, open) {
    const isOpen = !!open;
    wrap.classList.toggle("md-to-docx-batch-float-open", isOpen);
    const launcher = wrap.querySelector(".md-to-docx-batch-launcher");
    if (launcher) {
      launcher.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    if (isOpen) positionBatchSheet(wrap);
  }

  function closeSheet() {
    const wrap = document.querySelector("." + FLOAT_CLASS);
    if (wrap) setFloatOpen(wrap, false);
  }

  function enableBatchDrag(wrap, onDragStart) {
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
      if (!e.target.closest(".md-to-docx-batch-launcher")) return;
      if (e.target.closest(".md-to-docx-batch-sheet")) return;
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
        wrap.classList.add("md-to-docx-batch-float-dragging");
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
      wrap.classList.remove("md-to-docx-batch-float-dragging");
      if (wasDragging) {
        try {
          wrap.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      if (moved) {
        const rect = wrap.getBoundingClientRect();
        const pos = clampFloatPosition(wrap, rect.left, rect.top);
        applyFloatPosition(wrap, pos);
        storageLocalSet({ batchFloatPos: pos }).catch(() => {});
        wrap.dataset.dragged = "1";
        setTimeout(() => {
          delete wrap.dataset.dragged;
        }, 0);
      }
    }

    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
  }

  function updateBar(wrap) {
    if (!wrap) return;
    const n = SELECTED.size;
    const countEl = wrap.querySelector(".md-to-docx-batch-count");
    const hint = wrap.querySelector(".md-to-docx-batch-hint");
    const exportBtn = wrap.querySelector(".md-to-docx-batch-export");
    const clearBtn = wrap.querySelector(".md-to-docx-batch-clear");
    const pill = wrap.querySelector(".md-to-docx-batch-count-pill");
    if (countEl) countEl.textContent = String(n);
    if (hint) {
      hint.textContent =
        n === 0
          ? "Click Select chats, then tick items"
          : n + " chat" + (n === 1 ? "" : "s") + " selected";
    }
    if (exportBtn) {
      exportBtn.disabled = n === 0;
      exportBtn.textContent = "Export (" + n + ")";
    }
    if (clearBtn) {
      clearBtn.hidden = n === 0;
    }
    if (pill) {
      if (n > 0) {
        pill.hidden = false;
        pill.textContent = n > 99 ? "99+" : String(n);
      } else {
        pill.hidden = true;
        pill.textContent = "";
      }
    }
  }

  function positionPanelNearFloat(panel, wrap) {
    if (!panel || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const panelW = Math.min(360, window.innerWidth - 40);
    const panelH = Math.min(420, window.innerHeight - 40);
    const gap = 12;
    const pad = 8;
    let left = rect.left;
    let top = rect.top - panelH - gap;
    if (top < pad) top = rect.bottom + gap;
    left = Math.min(Math.max(pad, left), window.innerWidth - panelW - pad);
    top = Math.min(Math.max(pad, top), window.innerHeight - panelH - pad);
    panel.style.left = left + "px";
    panel.style.top = top + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.width = panelW + "px";
    panel.style.maxHeight = panelH + "px";
  }

  function ensureBar(hooks) {
    let wrap = document.querySelector("." + FLOAT_CLASS);
    if (wrap) return wrap;

    wrap = createEl("div", FLOAT_CLASS);
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", "Batch export");

    const launcher = createEl("button", "md-to-docx-batch-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.title = "Batch export (drag to move)";
    launcher.setAttribute("aria-label", "Batch export (drag to move)");
    launcher.appendChild(createBatchBadge());
    const pill = createEl("span", "md-to-docx-batch-count-pill");
    pill.hidden = true;
    launcher.appendChild(pill);

    const sheet = createEl("div", "md-to-docx-batch-sheet");
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-label", "Batch export");

    const header = createEl("div", "md-to-docx-batch-sheet-header");
    header.appendChild(createEl("div", "md-to-docx-batch-title", "Batch export"));
    const closeBtn = createEl("button", "md-to-docx-batch-sheet-close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.appendChild(createCloseIcon());
    header.appendChild(closeBtn);

    const countLine = createEl("div", "md-to-docx-batch-count-line");
    countLine.appendChild(createEl("strong", "md-to-docx-batch-count", "0"));
    countLine.appendChild(document.createTextNode(" selected"));

    const hint = createEl(
      "div",
      "md-to-docx-batch-hint",
      "Click Select chats, then tick items"
    );

    const actions = createEl("div", "md-to-docx-batch-actions");

    const selectBtn = createEl(
      "button",
      "md-to-docx-batch-select md-to-docx-batch-btn-secondary",
      "Select chats"
    );
    selectBtn.type = "button";

    const clearBtn = createEl(
      "button",
      "md-to-docx-batch-clear md-to-docx-batch-btn-secondary",
      "Clear"
    );
    clearBtn.type = "button";
    clearBtn.hidden = true;

    const exportBtn = createEl(
      "button",
      "md-to-docx-export-btn md-to-docx-batch-export",
      "Export (0)"
    );
    exportBtn.type = "button";
    exportBtn.disabled = true;

    actions.appendChild(selectBtn);
    actions.appendChild(clearBtn);
    actions.appendChild(exportBtn);

    sheet.appendChild(header);
    sheet.appendChild(countLine);
    sheet.appendChild(hint);
    sheet.appendChild(actions);

    wrap.appendChild(launcher);
    wrap.appendChild(sheet);
    document.body.appendChild(wrap);

    launcher.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (wrap.dataset.dragged === "1") return;
      setFloatOpen(wrap, !wrap.classList.contains("md-to-docx-batch-float-open"));
    });

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSheet();
    });

    selectBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPanel(hooks);
    });

    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      SELECTED.clear();
      updateBar(wrap);
      const panel = document.querySelector("." + PANEL_CLASS);
      if (panel && !panel.hidden) renderPanelList(panel, hooks);
    });

    exportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
      closeSheet();
      runBatchExport(hooks);
    });

    document.addEventListener(
      "pointerdown",
      (e) => {
        if (!wrap.classList.contains("md-to-docx-batch-float-open")) return;
        const panel = document.querySelector("." + PANEL_CLASS);
        if (panel && !panel.hidden) return;
        if (wrap.contains(e.target)) return;
        if (panel && panel.contains(e.target)) return;
        closeSheet();
      },
      true
    );

    enableBatchDrag(wrap, closeSheet);
    storageLocalGet(["batchFloatPos"])
      .then((items) => {
        applyFloatPosition(wrap, items.batchFloatPos);
      })
      .catch(() => {
        applyFloatPosition(wrap, null);
      });

    return wrap;
  }

  function ensureBackdrop() {
    let backdrop = document.querySelector("." + BACKDROP_CLASS);
    if (backdrop) return backdrop;
    backdrop = createEl("div", BACKDROP_CLASS);
    backdrop.hidden = true;
    backdrop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
    });
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function ensurePanel(hooks) {
    let panel = document.querySelector("." + PANEL_CLASS);
    if (panel) return panel;

    panel = createEl("div", PANEL_CLASS);
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Select chats");
    panel.hidden = true;

    const header = createEl("div", "md-to-docx-batch-panel-header");
    header.appendChild(createEl("div", "md-to-docx-batch-panel-title", "Select chats"));

    const closeBtn = createEl("button", "md-to-docx-batch-panel-close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.appendChild(createCloseIcon());
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
    });
    header.appendChild(closeBtn);

    const body = createEl("div", "md-to-docx-batch-panel-body");
    const list = createEl("div", "md-to-docx-batch-panel-list");
    body.appendChild(list);

    const footer = createEl("div", "md-to-docx-batch-panel-footer");
    const refreshBtn = createEl(
      "button",
      "md-to-docx-batch-refresh md-to-docx-batch-btn-secondary",
      "Refresh list"
    );
    refreshBtn.type = "button";
    refreshBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      renderPanelList(panel, hooks);
    });

    const doneBtn = createEl("button", "md-to-docx-export-btn md-to-docx-batch-done", "Done");
    doneBtn.type = "button";
    doneBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
    });

    footer.appendChild(refreshBtn);
    footer.appendChild(doneBtn);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);
    document.body.appendChild(panel);
    return panel;
  }

  function renderPanelList(panel, hooks) {
    const list = panel.querySelector(".md-to-docx-batch-panel-list");
    if (!list) return;
    list.textContent = "";

    const items =
      (hooks && typeof hooks.listSidebarConversations === "function"
        ? hooks.listSidebarConversations()
        : []) || [];

    if (!items.length) {
      list.appendChild(
        createEl(
          "div",
          "md-to-docx-batch-empty",
          "No chats found. Scroll the site sidebar to load more, then Refresh."
        )
      );
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const row = createEl("label", "md-to-docx-batch-row");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "md-to-docx-batch-row-cb";
      cb.checked = SELECTED.has(item.id);
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        if (cb.checked) {
          SELECTED.set(item.id, item);
        } else {
          SELECTED.delete(item.id);
        }
        const wrap = document.querySelector("." + FLOAT_CLASS);
        updateBar(wrap);
      });
      const title = createEl(
        "span",
        "md-to-docx-batch-row-title",
        item.title || item.id
      );
      row.appendChild(cb);
      row.appendChild(title);
      list.appendChild(row);
    }
  }

  function openPanel(hooks) {
    const backdrop = ensureBackdrop();
    const panel = ensurePanel(hooks);
    const wrap = document.querySelector("." + FLOAT_CLASS);
    if (wrap) setFloatOpen(wrap, true);
    renderPanelList(panel, hooks);
    backdrop.hidden = false;
    panel.hidden = false;
    if (wrap) positionPanelNearFloat(panel, wrap);
  }

  function closePanel() {
    const panel = document.querySelector("." + PANEL_CLASS);
    const backdrop = document.querySelector("." + BACKDROP_CLASS);
    if (panel) panel.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }

  function onDocKeyDown(e) {
    if (e.key !== "Escape") return;
    const panel = document.querySelector("." + PANEL_CLASS);
    if (panel && !panel.hidden) {
      closePanel();
      return;
    }
    const wrap = document.querySelector("." + FLOAT_CLASS);
    if (wrap && wrap.classList.contains("md-to-docx-batch-float-open")) {
      closeSheet();
    }
  }

  function conversationFingerprint(hooks) {
    const href = String((global.location && global.location.href) || "");
    let body = "";
    try {
      const data = hooks.extractConversationMarkdown(document);
      body = (data && data.markdown) || "";
    } catch (_) {}
    return href + "\n" + body.slice(0, 800);
  }

  function stripLeadingTitle(markdown) {
    return String(markdown || "")
      .replace(/^#\s+[^\n]+\n+/, "")
      .trim();
  }

  async function runBatchExport(hooks) {
    const items = Array.from(SELECTED.values());
    if (!items.length) return;
    const sections = [];
    let previousFp = conversationFingerprint(hooks);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      global.MdToDocxExport.showToast(
        "Exporting " + (i + 1) + "/" + items.length + ": " + (item.title || item.id)
      );
      try {
        const beforeFp = conversationFingerprint(hooks);
        await hooks.openConversation(item);
        const ready = await waitFor(() => {
          if (
            typeof hooks.isConversationReady === "function" &&
            !hooks.isConversationReady()
          ) {
            return false;
          }
          const fp = conversationFingerprint(hooks);
          // Require content or URL change so SPA leftover DOM is not reused.
          return !!(fp && fp !== beforeFp && fp !== previousFp);
        }, 5000);
        if (!ready) {
          await wait(600);
        }
        const data = hooks.extractConversationMarkdown(document);
        const fp = conversationFingerprint(hooks);
        if (fp === previousFp) {
          global.MdToDocxExport.showToast(
            "Skipped stale chat: " + (item.title || item.id)
          );
          continue;
        }
        previousFp = fp;
        const title = (data && data.title) || item.title || item.id;
        const body = stripLeadingTitle((data && data.markdown) || "");
        if (body.trim()) {
          sections.push("## Session: " + title + "\n\n" + body.trim());
        }
      } catch (err) {
        global.MdToDocxExport.showToast(
          "Failed: " + (item.title || item.id) + " — " + (err.message || err)
        );
      }
    }

    if (!sections.length) {
      global.MdToDocxExport.showToast("No conversation content found for selection");
      return;
    }

    const markdown = "# Batch export\n\n" + sections.join("\n\n---\n\n");
    const title = "batch_export_" + items.length + "_sessions";
    await global.MdToDocxExport.convertAndDownload(markdown, title);
  }

  /**
   * @param {{
   *   listSidebarConversations: () => {id:string,title:string,el:Element}[],
   *   openConversation: (item) => Promise<void>,
   *   extractConversationMarkdown: (document) => {markdown:string,title:string}|null,
   *   isConversationReady?: () => boolean,
   * }} hooks
   */
  function setupBatchExport(hooks) {
    if (!hooks || typeof hooks.listSidebarConversations !== "function") return;

    const bar = ensureBar(hooks);
    ensureBackdrop();
    ensurePanel(hooks);
    updateBar(bar);
    document.addEventListener("keydown", onDocKeyDown, true);

    function sync() {
      updateBar(bar);
      const panel = document.querySelector("." + PANEL_CLASS);
      if (panel && !panel.hidden) {
        renderPanelList(panel, hooks);
      }
    }

    const obs = global.MdToDocxObserve
      ? global.MdToDocxObserve.watch(document.body, () => {
          obs.runQuiet(() => sync());
        })
      : null;
    if (!obs) {
      const observer = new MutationObserver(() => sync());
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return {
      sync,
      bar,
      openPanel: () => openPanel(hooks),
      closePanel,
      getSelected: () => Array.from(SELECTED.values()),
    };
  }

  global.MdToDocxBatch = {
    setupBatchExport,
    wait,
    waitFor,
  };
})(typeof window !== "undefined" ? window : globalThis);
