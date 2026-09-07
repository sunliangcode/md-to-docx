/* HTML → Markdown via Turndown (MIT), with table rule + beautify. */
(function (global) {
  const TurndownService = global.TurndownService;
  if (typeof TurndownService !== "function") {
    throw new Error("TurndownService is required; load vendor/turndown/turndown.js first");
  }

  function cellText(cell) {
    return String(cell.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tableToMarkdown(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!rows.length) return "";
    const lines = rows.map((tr) => {
      const cells = Array.from(tr.querySelectorAll("th, td")).map(cellText);
      return "| " + cells.join(" | ") + " |";
    });
    if (lines.length > 1) {
      const sep =
        "| " +
        lines[0]
          .split("|")
          .slice(1, -1)
          .map(() => "---")
          .join(" | ") +
        " |";
      lines.splice(1, 0, sep);
    }
    return lines.join("\n");
  }

  function createService() {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });

    service.remove([
      "script",
      "style",
      "noscript",
      "svg",
      "nav",
      "iframe",
      "template",
    ]);

    // Turndown core has no GFM tables; keep a small custom rule.
    service.addRule("table", {
      filter: "table",
      replacement: function (_content, node) {
        const md = tableToMarkdown(node);
        return md ? "\n\n" + md + "\n\n" : "";
      },
    });

    return service;
  }

  const service = createService();

  function beautifyMarkdown(md) {
    let out = String(md || "");
    out = out.replace(/[ \t]+\n/g, "\n");
    out = out.replace(/\*\*\s*\*\*/g, "");
    out = out.replace(/\[\s*\]\(\s*\)/g, "");
    out = out.replace(/!\[\s*\]\(\s*\)/g, "");
    // Ensure blank line before headings / fences / lists when jammed
    out = out.replace(/([^\n])\n(#{1,6} )/g, "$1\n\n$2");
    out = out.replace(/([^\n])\n(```)/g, "$1\n\n$2");
    out = out.replace(/([^\n])\n([-*+] )/g, "$1\n\n$2");
    out = out.replace(/([^\n])\n(\d+\. )/g, "$1\n\n$2");
    // Blank line after headings
    out = out.replace(/(^#{1,6} .+)\n([^\n#])/gm, "$1\n\n$2");
    out = out.replace(/\n{3,}/g, "\n\n");
    return out.trim();
  }

  function htmlToMarkdown(html) {
    return beautifyMarkdown(service.turndown(html || ""));
  }

  global.MdToDocxHtml = { htmlToMarkdown, beautifyMarkdown };
})(typeof window !== "undefined" ? window : globalThis);
