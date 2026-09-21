const DEFAULTS = {
  endpoint: "http://127.0.0.1:8080",
  preset: "technical",
  numbering: false,
  fallbackMd: true,
  showFloating: true,
  enableWebpageExport: false,
  locale: "en",
};

const FIELD_IDS = [
  "endpoint",
  "preset",
  "numbering",
  "fallbackMd",
  "showFloating",
  "enableWebpageExport",
];

const STRINGS = {
  en: {
    pageTitle: "md-to-docx — Extension Options",
    langLabel: "Language",
    eyebrow: "Browser extension",
    title: "md-to-docx Export",
    lead:
      "Conversion runs on your local Playground — content is sent only to a <strong>loopback</strong> endpoint. When Playground is offline, buttons can fall back to <strong>Export MD</strong>.",
    secConnection: "Connection",
    endpointLabel: "Convert endpoint URL",
    endpointHint: "Localhost only — keeps chat content on your machine.",
    endpointError:
      "Endpoint must be http(s)://127.0.0.1 or localhost (keeps chat content on your machine).",
    presetLabel: "Default preset",
    secExport: "Export behavior",
    numberingTitle: "Heading numbering",
    numberingDesc: "Overrides the preset when checked.",
    fallbackTitle: "Download .md if convert fails",
    fallbackDesc: "Also used when Playground is offline.",
    secUi: "On-page UI",
    floatingTitle: "Show floating export button",
    floatingDesc: "Circular launcher on AI chat pages. Click to open the sheet; drag to move.",
    webpageTitle: "Enable webpage export on all sites",
    webpageDesc:
      "Off by default. Chrome will ask for access to all websites when you turn this on.",
    btnSave: "Save",
    btnTest: "Test connection",
    btnReset: "Reset",
    dirty: "Unsaved changes",
    shortcutSave: "to save",
    footerStart: "Start Playground:",
    savedOk: "Saved. Refresh open tabs to apply.",
    savedNoWebpage: "Saved without webpage export (permission denied).",
    resetHint: "Reset to defaults — click Save to apply.",
    leaveWarn: "You have unsaved changes.",
    onlineAt: "Playground is online at {endpoint}",
    httpStatus: "Endpoint responded with HTTP {status}",
    timedOut: "Timed out — is Playground running?",
    unreachable: "Unreachable — start Playground, then try again.",
    permError: "Could not request webpage permission: {error}",
  },
  zh: {
    pageTitle: "md-to-docx — 扩展设置",
    langLabel: "语言",
    eyebrow: "浏览器扩展",
    title: "md-to-docx 导出",
    lead:
      "转换在本地 Playground 完成 — 内容只发往 <strong>本机回环</strong> 地址。Playground 离线时，按钮可回退为 <strong>导出 MD</strong>。",
    secConnection: "连接",
    endpointLabel: "转换服务地址",
    endpointHint: "仅限本机地址 — 聊天内容不会离开你的电脑。",
    endpointError: "地址必须是 http(s)://127.0.0.1 或 localhost（确保内容留在本机）。",
    presetLabel: "默认样式预设",
    secExport: "导出行为",
    numberingTitle: "标题编号",
    numberingDesc: "勾选后覆盖预设中的编号设置。",
    fallbackTitle: "转换失败时下载 .md",
    fallbackDesc: "Playground 离线时同样生效。",
    secUi: "页面内界面",
    floatingTitle: "显示浮动导出按钮",
    floatingDesc: "在 AI 对话页显示圆形启动器。点击打开面板，可拖动位置。",
    webpageTitle: "在所有网站启用网页导出",
    webpageDesc: "默认关闭。开启时 Chrome 会请求访问所有网站的权限。",
    btnSave: "保存",
    btnTest: "测试连接",
    btnReset: "重置",
    dirty: "有未保存的更改",
    shortcutSave: "保存",
    footerStart: "启动 Playground：",
    savedOk: "已保存。请刷新已打开的标签页以生效。",
    savedNoWebpage: "已保存，但未开启网页导出（权限被拒绝）。",
    resetHint: "已恢复默认值 — 点击保存以应用。",
    leaveWarn: "有未保存的更改。",
    onlineAt: "Playground 在线：{endpoint}",
    httpStatus: "服务返回 HTTP {status}",
    timedOut: "连接超时 — Playground 是否已启动？",
    unreachable: "无法连接 — 请先启动 Playground 再试。",
    permError: "无法请求网页权限：{error}",
  },
};

let savedSnapshot = "";
let statusTimer = null;
let currentLocale = "en";

function detectLocale() {
  try {
    const lang = String(navigator.language || "en").toLowerCase();
    return lang.startsWith("zh") ? "zh" : "en";
  } catch (_) {
    return "en";
  }
}

function t(key, vars) {
  const table = STRINGS[currentLocale] || STRINGS.en;
  let text = table[key] != null ? table[key] : STRINGS.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      text = text.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
    });
  }
  return text;
}

function modKeyLabel() {
  try {
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "")
      ? "⌘"
      : "Ctrl";
  } catch (_) {
    return "Ctrl";
  }
}

function applyLocale(locale) {
  currentLocale = locale === "zh" ? "zh" : "en";
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });

  const langSwitch = document.getElementById("lang-switch");
  if (langSwitch) langSwitch.setAttribute("aria-label", t("langLabel"));

  document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
    const active = btn.getAttribute("data-lang") === currentLocale;
    btn.classList.toggle("lang-switch__btn--active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const hint = document.getElementById("shortcut-hint");
  if (hint) {
    hint.innerHTML =
      "<kbd>" +
      modKeyLabel() +
      "</kbd><kbd>S</kbd> " +
      t("shortcutSave");
  }

  updateDirtyUi();
}

function isLoopbackEndpoint(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = (u.hostname || "").toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "[::1]" || host === "::1";
  } catch (_) {
    return false;
  }
}

function storageGet(defaults) {
  return new Promise((resolve) => {
    try {
      if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.sync) {
        resolve({ ...defaults });
        return;
      }
      chrome.storage.sync.get(defaults, (items) => {
        resolve({ ...defaults, ...(items || {}) });
      });
    } catch (_) {
      resolve({ ...defaults });
    }
  });
}

function storageSet(obj) {
  return new Promise((resolve) => {
    try {
      if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.sync) {
        resolve();
        return;
      }
      chrome.storage.sync.set(obj, resolve);
    } catch (_) {
      resolve();
    }
  });
}

function runtimeSend(message) {
  return new Promise((resolve) => {
    try {
      if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
        resolve();
        return;
      }
      chrome.runtime.sendMessage(message, () => resolve());
    } catch (_) {
      resolve();
    }
  });
}

async function requestWebpagePermission() {
  try {
    if (typeof chrome === "undefined" || !chrome.permissions || !chrome.permissions.request) {
      return false;
    }
    return await chrome.permissions.request({
      origins: ["http://*/*", "https://*/*"],
    });
  } catch (_) {
    return false;
  }
}

async function removeWebpagePermission() {
  try {
    if (typeof chrome === "undefined" || !chrome.permissions || !chrome.permissions.remove) {
      return;
    }
    await chrome.permissions.remove({ origins: ["http://*/*", "https://*/*"] });
  } catch (_) {}
}

function readFormState() {
  return {
    endpoint: document.getElementById("endpoint").value.trim().replace(/\/$/, ""),
    preset: document.getElementById("preset").value,
    numbering: document.getElementById("numbering").checked,
    fallbackMd: document.getElementById("fallbackMd").checked,
    showFloating: document.getElementById("showFloating").checked,
    enableWebpageExport: document.getElementById("enableWebpageExport").checked,
  };
}

function snapshotOf(state) {
  return JSON.stringify(state);
}

function setStatus(message, kind) {
  const status = document.getElementById("status");
  status.textContent = message || "";
  status.classList.remove("status--ok", "status--err");
  if (kind === "ok") status.classList.add("status--ok");
  if (kind === "err") status.classList.add("status--err");

  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }
  if (message && kind === "ok") {
    statusTimer = setTimeout(() => {
      status.textContent = "";
      status.classList.remove("status--ok", "status--err");
      statusTimer = null;
    }, 4200);
  }
}

function setEndpointError(message) {
  const endpoint = document.getElementById("endpoint");
  const endpointError = document.getElementById("endpointError");
  if (message) {
    endpointError.textContent = message;
    endpointError.hidden = false;
    endpoint.classList.add("field__control--error");
    endpoint.setAttribute("aria-invalid", "true");
  } else {
    endpointError.textContent = "";
    endpointError.hidden = true;
    endpoint.classList.remove("field__control--error");
    endpoint.setAttribute("aria-invalid", "false");
  }
}

function setButtonBusy(btn, busy) {
  btn.disabled = busy || (btn.id === "save" && !isDirty());
  btn.classList.toggle("btn--loading", busy);
  btn.setAttribute("aria-busy", busy ? "true" : "false");
}

function isDirty() {
  return snapshotOf(readFormState()) !== savedSnapshot;
}

function updateDirtyUi() {
  const dirty = isDirty();
  const dirtyEl = document.getElementById("dirty");
  const save = document.getElementById("save");
  dirtyEl.textContent = dirty ? t("dirty") : "";
  dirtyEl.classList.toggle("dirty--on", dirty);
  if (!save.classList.contains("btn--loading")) {
    save.disabled = !dirty;
  }
}

function markClean(state) {
  const form = state
    ? {
        endpoint: state.endpoint,
        preset: state.preset,
        numbering: !!state.numbering,
        fallbackMd: state.fallbackMd !== false,
        showFloating: state.showFloating !== false,
        enableWebpageExport: !!state.enableWebpageExport,
      }
    : readFormState();
  savedSnapshot = snapshotOf(form);
  updateDirtyUi();
}

function validateEndpoint(showError) {
  const endpoint = document.getElementById("endpoint").value.trim().replace(/\/$/, "");
  const ok = isLoopbackEndpoint(endpoint);
  if (!ok && showError) {
    setEndpointError(t("endpointError"));
  } else if (ok) {
    setEndpointError("");
  }
  return ok ? endpoint : null;
}

async function saveOptions(event) {
  if (event) event.preventDefault();

  const state = readFormState();
  const endpoint = validateEndpoint(true);
  if (!endpoint) {
    setStatus("");
    document.getElementById("endpoint").focus();
    return;
  }

  const saveBtn = document.getElementById("save");
  const testBtn = document.getElementById("test");
  const resetBtn = document.getElementById("reset");
  setButtonBusy(saveBtn, true);
  testBtn.disabled = true;
  resetBtn.disabled = true;
  setStatus("");

  try {
    let webpageEnabled = state.enableWebpageExport;

    if (state.enableWebpageExport) {
      const ok = await requestWebpagePermission();
      if (!ok) {
        document.getElementById("enableWebpageExport").checked = false;
        webpageEnabled = false;
        const saved = {
          endpoint,
          preset: state.preset,
          numbering: state.numbering,
          fallbackMd: state.fallbackMd,
          showFloating: state.showFloating,
          enableWebpageExport: false,
          locale: currentLocale,
        };
        await storageSet(saved);
        await runtimeSend({ type: "md-to-docx-sync-webpage", enabled: false });
        markClean(saved);
        setStatus(t("savedNoWebpage"), "ok");
        return;
      }
    } else {
      await removeWebpagePermission();
    }

    const saved = {
      endpoint,
      preset: state.preset,
      numbering: state.numbering,
      fallbackMd: state.fallbackMd,
      showFloating: state.showFloating,
      enableWebpageExport: webpageEnabled,
      locale: currentLocale,
    };

    await storageSet(saved);
    await runtimeSend({ type: "md-to-docx-sync-webpage", enabled: webpageEnabled });
    markClean(saved);
    setStatus(t("savedOk"), "ok");
  } finally {
    setButtonBusy(saveBtn, false);
    testBtn.disabled = false;
    resetBtn.disabled = false;
    updateDirtyUi();
  }
}

async function testConnection() {
  const endpoint = validateEndpoint(true);
  if (!endpoint) {
    document.getElementById("endpoint").focus();
    return;
  }

  const testBtn = document.getElementById("test");
  const saveBtn = document.getElementById("save");
  const resetBtn = document.getElementById("reset");
  setButtonBusy(testBtn, true);
  saveBtn.disabled = true;
  resetBtn.disabled = true;
  setStatus("");

  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 2500) : null;
    const res = await fetch(endpoint + "/healthz", {
      method: "GET",
      signal: controller ? controller.signal : undefined,
    });
    if (timer) clearTimeout(timer);
    if (res.ok) {
      setStatus(t("onlineAt", { endpoint }), "ok");
    } else {
      setStatus(t("httpStatus", { status: res.status }), "err");
    }
  } catch (err) {
    const aborted = err && err.name === "AbortError";
    setStatus(aborted ? t("timedOut") : t("unreachable"), "err");
  } finally {
    setButtonBusy(testBtn, false);
    resetBtn.disabled = false;
    updateDirtyUi();
  }
}

function resetOptions() {
  document.getElementById("endpoint").value = DEFAULTS.endpoint;
  document.getElementById("preset").value = DEFAULTS.preset;
  document.getElementById("numbering").checked = !!DEFAULTS.numbering;
  document.getElementById("fallbackMd").checked = DEFAULTS.fallbackMd !== false;
  document.getElementById("showFloating").checked = DEFAULTS.showFloating !== false;
  document.getElementById("enableWebpageExport").checked = !!DEFAULTS.enableWebpageExport;
  setEndpointError("");
  setStatus(t("resetHint"), "ok");
  updateDirtyUi();
}

function applyItems(items) {
  document.getElementById("endpoint").value = items.endpoint;
  document.getElementById("preset").value = items.preset;
  document.getElementById("numbering").checked = !!items.numbering;
  document.getElementById("fallbackMd").checked = items.fallbackMd !== false;
  document.getElementById("showFloating").checked = items.showFloating !== false;
  document.getElementById("enableWebpageExport").checked = !!items.enableWebpageExport;
  markClean(readFormState());
}

async function setLocale(locale) {
  applyLocale(locale);
  await storageSet({ locale: currentLocale });
}

document.getElementById("options-form").addEventListener("submit", saveOptions);
document.getElementById("test").addEventListener("click", testConnection);
document.getElementById("reset").addEventListener("click", resetOptions);

document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    if (lang && lang !== currentLocale) setLocale(lang);
  });
});

FIELD_IDS.forEach((id) => {
  const el = document.getElementById(id);
  const eventName = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
  el.addEventListener(eventName, updateDirtyUi);
});

document.getElementById("endpoint").addEventListener("blur", () => {
  const value = document.getElementById("endpoint").value.trim();
  if (value) validateEndpoint(true);
});

document.getElementById("endpoint").addEventListener("input", () => {
  if (document.getElementById("endpoint").classList.contains("field__control--error")) {
    validateEndpoint(true);
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    if (isDirty() && !document.getElementById("save").classList.contains("btn--loading")) {
      saveOptions();
    }
  }
});

window.addEventListener("beforeunload", (e) => {
  if (!isDirty()) return;
  e.preventDefault();
  e.returnValue = t("leaveWarn");
});

storageGet({ ...DEFAULTS, locale: detectLocale() }).then((items) => {
  applyLocale(items.locale === "zh" ? "zh" : items.locale === "en" ? "en" : detectLocale());
  applyItems(items);
});
