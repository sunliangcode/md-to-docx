const WEBPAGE_SCRIPT_ID = "md-to-docx-webpage";

const WEBPAGE_SCRIPT = {
  id: WEBPAGE_SCRIPT_ID,
  matches: ["http://*/*", "https://*/*"],
  excludeMatches: [
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://chat.deepseek.com/*",
    "https://kimi.moonshot.cn/*",
    "https://www.kimi.com/*",
    "https://www.doubao.com/*",
    "http://127.0.0.1/*",
    "http://localhost/*",
  ],
  js: [
    "vendor/turndown/turndown.js",
    "src/lib/html-to-md.js",
    "src/lib/extract.js",
    "src/lib/observe.js",
    "src/lib/export.js",
    "src/content/webpage.js",
  ],
  css: ["src/button.css"],
  runAt: "document_idle",
};

async function syncWebpageScript(enabled) {
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts({
      ids: [WEBPAGE_SCRIPT_ID],
    });
    if (existing && existing.length) {
      await chrome.scripting.unregisterContentScripts({ ids: [WEBPAGE_SCRIPT_ID] });
    }
  } catch (_) {}

  if (!enabled) return;

  const granted = await chrome.permissions.contains({
    origins: ["http://*/*", "https://*/*"],
  });
  if (!granted) return;

  await chrome.scripting.registerContentScripts([WEBPAGE_SCRIPT]);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ enableWebpageExport: false }, (items) => {
    syncWebpageScript(!!items.enableWebpageExport).catch(() => {});
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get({ enableWebpageExport: false }, (items) => {
    syncWebpageScript(!!items.enableWebpageExport).catch(() => {});
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "md-to-docx-sync-webpage") return;
  syncWebpageScript(!!msg.enabled)
    .then(() => sendResponse({ ok: true }))
    .catch((err) => sendResponse({ ok: false, error: String(err && err.message) }));
  return true;
});
