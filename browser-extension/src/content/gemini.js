(function () {
  const USER_SEL =
    "user-query, .user-query, [data-message-author-role='user'], .query-text";
  const ASST_SEL =
    "model-response, .model-response-text, .response-content, message-content";

  function sortByDocumentOrder(items) {
    return items.slice().sort((a, b) => {
      if (a.el === b.el) return 0;
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  function dedupeNested(items) {
    const out = [];
    for (const item of items) {
      const nested = out.some(
        (prev) =>
          prev.el !== item.el &&
          (prev.el.contains(item.el) || item.el.contains(prev.el))
      );
      if (nested) {
        // Prefer the outer assistant/user container when nested.
        const idx = out.findIndex(
          (prev) => prev.el.contains(item.el) || item.el.contains(prev.el)
        );
        if (idx >= 0) {
          const prev = out[idx];
          if (prev.el.contains(item.el)) continue;
          out[idx] = item;
        }
        continue;
      }
      out.push(item);
    }
    return out;
  }

  function extractTurns(document) {
    const turns = [];
    document.querySelectorAll(USER_SEL).forEach((el) => {
      if ((el.textContent || "").trim()) turns.push({ role: "user", el });
    });
    document.querySelectorAll(ASST_SEL).forEach((el) => {
      // Skip assistant nodes nested inside another matched assistant node
      if (el.closest && el.parentElement && el.parentElement.closest(ASST_SEL)) {
        return;
      }
      if ((el.textContent || "").trim().length > 5) {
        turns.push({ role: "assistant", el });
      }
    });

    if (!turns.length) {
      document
        .querySelectorAll(".model-response-text, .response-content, .markdown")
        .forEach((el) => turns.push({ role: "assistant", el }));
    }

    return dedupeNested(sortByDocumentOrder(turns));
  }

  function extractConversationMarkdown(document) {
    const turns = extractTurns(document);
    if (!turns.length) return null;
    const title = document.title || "Gemini";
    return {
      markdown: MdToDocxExtract.turnsToMarkdown(turns, title),
      title,
    };
  }

  function extractLatestAssistantMarkdown(document) {
    const turns = extractTurns(document).filter((t) => t.role === "assistant");
    const last = turns[turns.length - 1];
    if (!last) return null;
    return {
      markdown: MdToDocxExtract.elementToMarkdown(last.el),
      title: document.title || "Gemini",
    };
  }

  function attachButtons() {
    const nodes = document.querySelectorAll(
      ".model-response-text, .response-content, message-content"
    );
    const last = nodes[nodes.length - 1];
    if (!last) return;
    MdToDocxExport.injectExportButton(last.parentElement || last, () => {
      const data = extractConversationMarkdown(document);
      if (!data || !data.markdown.trim()) {
        MdToDocxExport.showToast("Could not find conversation content on this page");
        return;
      }
      MdToDocxExport.convertAndDownload(data.markdown, data.title);
    });
  }

  function setup() {
    const obs = MdToDocxObserve.watch(document.body, () => {
      obs.runQuiet(() => attachButtons());
    });
    obs.runQuiet(() => attachButtons());
    MdToDocxExport.injectFloatingButton(() => {
      const data = extractConversationMarkdown(document);
      if (!data || !data.markdown.trim()) {
        MdToDocxExport.showToast("Could not find conversation content on this page");
        return;
      }
      MdToDocxExport.convertAndDownload(data.markdown, data.title);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      extractLatestAssistantMarkdown,
      extractConversationMarkdown,
      extractTurns,
    };
  }
})();
