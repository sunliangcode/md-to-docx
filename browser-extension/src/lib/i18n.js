(function (global) {
  const STRINGS = {
    en: {
      labelWord: "Export to Word",
      labelMd: "Export MD",
      hintOnline: "Local Playground",
      hintOffline: "Download Markdown",
      exporting: "Exporting…",
      statusOnline: "Playground online",
      statusOffline: "Playground offline",
      dragToMove: "{label} (drag to move)",
      exportTitle: "Export",
      close: "Close",
      dismiss: "Dismiss",
      extUpdated: "Extension was updated — refresh this page",
      downloadedMdUpdated: "Downloaded {file} — extension was updated, refresh this page",
      downloadedMdOffline: "Downloaded {file} (Playground offline)",
      offlineEnableFallback: "Playground offline. Enable MD fallback in extension options.",
      downloadedDocx: "Downloaded {file}",
      downloadedMdHint:
        "Downloaded {file} (Playground offline). Hint: docker compose -f web/docker-compose.yml up --build",
      exportFailed: "Export failed",
      errNoConversation: "Could not find conversation content on this page",
      errNoPageContent: "Could not find exportable content on this page",
      batchRegion: "Batch export",
      batchTitle: "Batch export",
      batchDrag: "Batch export (drag to move)",
      batchSelect: "Select chats",
      batchClear: "Clear",
      batchExport: "Export ({n})",
      batchExporting: "Exporting…",
      batchHintEmpty: "Click Select chats, then tick items",
      batchHintSelected: "{n} chat selected",
      batchHintSelectedPlural: "{n} chats selected",
      batchSelectedSuffix: " selected",
      batchPanelTitle: "Select chats",
      batchRefresh: "Refresh list",
      batchSelectAll: "Select all",
      batchDone: "Done",
      batchEmpty:
        "No chats found. Scroll the site sidebar to load more, then Refresh.",
      batchProgress: "Exporting {current}/{total}{name}",
      batchFinishing: "Finishing download…",
      batchSkipped: "Skipped stale chat: {title}",
      batchFailed: "Failed: {title} — {error}",
      batchNoContent: "No conversation content found for selection",
    },
    zh: {
      labelWord: "导出为 Word",
      labelMd: "导出 MD",
      hintOnline: "本地 Playground",
      hintOffline: "下载 Markdown",
      exporting: "导出中…",
      statusOnline: "Playground 在线",
      statusOffline: "Playground 离线",
      dragToMove: "{label}（可拖动）",
      exportTitle: "导出",
      close: "关闭",
      dismiss: "关闭提示",
      extUpdated: "扩展已更新 — 请刷新此页面",
      downloadedMdUpdated: "已下载 {file} — 扩展已更新，请刷新此页面",
      downloadedMdOffline: "已下载 {file}（Playground 离线）",
      offlineEnableFallback: "Playground 离线。请在扩展设置中开启 MD 回退。",
      downloadedDocx: "已下载 {file}",
      downloadedMdHint:
        "已下载 {file}（Playground 离线）。提示：docker compose -f web/docker-compose.yml up --build",
      exportFailed: "导出失败",
      errNoConversation: "当前页面未找到可导出的对话内容",
      errNoPageContent: "当前页面未找到可导出的内容",
      batchRegion: "批量导出",
      batchTitle: "批量导出",
      batchDrag: "批量导出（可拖动）",
      batchSelect: "选择对话",
      batchClear: "清空",
      batchExport: "导出 ({n})",
      batchExporting: "导出中…",
      batchHintEmpty: "点击「选择对话」，然后勾选条目",
      batchHintSelected: "已选 {n} 个对话",
      batchHintSelectedPlural: "已选 {n} 个对话",
      batchSelectedSuffix: " 已选",
      batchPanelTitle: "选择对话",
      batchRefresh: "刷新列表",
      batchSelectAll: "全选",
      batchDone: "完成",
      batchEmpty: "未找到对话。请滚动网站侧边栏加载更多，然后刷新。",
      batchProgress: "正在导出 {current}/{total}{name}",
      batchFinishing: "正在完成下载…",
      batchSkipped: "已跳过过期对话：{title}",
      batchFailed: "失败：{title} — {error}",
      batchNoContent: "所选对话均未找到内容",
    },
  };

  let locale = "en";
  const listeners = [];
  let readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });

  function detectLocale() {
    try {
      const lang = String(
        (typeof navigator !== "undefined" && navigator.language) || "en"
      ).toLowerCase();
      return lang.startsWith("zh") ? "zh" : "en";
    } catch (_) {
      return "en";
    }
  }

  function normalizeLocale(value) {
    return value === "zh" ? "zh" : value === "en" ? "en" : detectLocale();
  }

  function t(key, vars) {
    const table = STRINGS[locale] || STRINGS.en;
    let text = table[key] != null ? table[key] : STRINGS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        text = text.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
      });
    }
    return text;
  }

  function getLocale() {
    return locale;
  }

  function setLocale(next, notify) {
    const normalized = normalizeLocale(next);
    if (normalized === locale) return;
    locale = normalized;
    if (notify !== false) {
      listeners.slice().forEach((fn) => {
        try {
          fn(locale);
        } catch (_) {}
      });
    }
  }

  function onLocaleChange(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function () {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function readStoredLocale() {
    return new Promise((resolve) => {
      try {
        if (
          typeof chrome === "undefined" ||
          !chrome.storage ||
          !chrome.storage.sync
        ) {
          resolve(detectLocale());
          return;
        }
        chrome.storage.sync.get({ locale: detectLocale() }, (items) => {
          resolve(normalizeLocale(items && items.locale));
        });
      } catch (_) {
        resolve(detectLocale());
      }
    });
  }

  function watchStorage() {
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.storage ||
        !chrome.storage.onChanged
      ) {
        return;
      }
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "sync" || !changes.locale) return;
        setLocale(changes.locale.newValue, true);
      });
    } catch (_) {}
  }

  readStoredLocale().then((lang) => {
    locale = lang;
    watchStorage();
    readyResolve(locale);
  });

  global.MdToDocxI18n = {
    t,
    getLocale,
    setLocale,
    onLocaleChange,
    detectLocale,
    ready,
    STRINGS,
  };
})(typeof window !== "undefined" ? window : globalThis);
