const DEFAULTS = {
  endpoint: "http://127.0.0.1:8080",
  preset: "technical",
  numbering: false,
  fallbackMd: true,
  showFloating: true,
  enableWebpageExport: false,
};

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

document.getElementById("save").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const endpointError = document.getElementById("endpointError");
  const endpoint = document.getElementById("endpoint").value.trim().replace(/\/$/, "");
  const preset = document.getElementById("preset").value;
  const numbering = document.getElementById("numbering").checked;
  const fallbackMd = document.getElementById("fallbackMd").checked;
  const showFloating = document.getElementById("showFloating").checked;
  const enableWebpageExport = document.getElementById("enableWebpageExport").checked;

  endpointError.hidden = true;
  if (!isLoopbackEndpoint(endpoint)) {
    endpointError.textContent =
      "Endpoint must be http(s)://127.0.0.1 or localhost (keeps chat content on your machine).";
    endpointError.hidden = false;
    status.textContent = "";
    return;
  }

  if (enableWebpageExport) {
    try {
      const ok = await chrome.permissions.request({
        origins: ["http://*/*", "https://*/*"],
      });
      if (!ok) {
        document.getElementById("enableWebpageExport").checked = false;
        status.textContent = "Saved without webpage export (permission denied).";
        chrome.storage.sync.set({
          endpoint,
          preset,
          numbering,
          fallbackMd,
          showFloating,
          enableWebpageExport: false,
        });
        chrome.runtime.sendMessage({ type: "md-to-docx-sync-webpage", enabled: false });
        return;
      }
    } catch (err) {
      status.textContent = "Could not request webpage permission: " + (err.message || err);
      return;
    }
  } else {
    try {
      await chrome.permissions.remove({ origins: ["http://*/*", "https://*/*"] });
    } catch (_) {}
  }

  chrome.storage.sync.set(
    { endpoint, preset, numbering, fallbackMd, showFloating, enableWebpageExport },
    () => {
      chrome.runtime.sendMessage(
        { type: "md-to-docx-sync-webpage", enabled: enableWebpageExport },
        () => {
          status.textContent = "Saved. Refresh open tabs to apply.";
        }
      );
    }
  );
});

chrome.storage.sync.get(DEFAULTS, (items) => {
  document.getElementById("endpoint").value = items.endpoint;
  document.getElementById("preset").value = items.preset;
  document.getElementById("numbering").checked = !!items.numbering;
  document.getElementById("fallbackMd").checked = items.fallbackMd !== false;
  document.getElementById("showFloating").checked = items.showFloating !== false;
  document.getElementById("enableWebpageExport").checked = !!items.enableWebpageExport;
});
