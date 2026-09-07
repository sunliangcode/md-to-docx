const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");

function createDom(html, url = "https://example.com", options = {}) {
  const dom = new JSDOM(html, {
    url,
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });
  if (!options.realMutationObserver) {
    // Adapters observe body; a live observer can recurse during fixture setup.
    dom.window.MutationObserver = class {
      observe() {}
      disconnect() {}
    };
  }
  // Stub chrome.storage for export.js
  dom.window.chrome = {
    storage: {
      sync: {
        get(defaults, cb) {
          cb({ ...defaults });
        },
        set(_obj, cb) {
          if (cb) cb();
        },
      },
      local: {
        get(_keys, cb) {
          cb({});
        },
        set(_obj, cb) {
          if (cb) cb();
        },
      },
    },
  };
  dom.window.fetch = async () => ({ ok: false });
  return dom;
}

function runInWindow(dom, relPath) {
  const code = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  vm.runInContext(code, dom.getInternalVMContext());
}

function loadHtmlToMd(dom) {
  runInWindow(dom, "vendor/turndown/turndown.js");
  runInWindow(dom, "src/lib/html-to-md.js");
}

function loadFixture(name, url) {
  const html = fs.readFileSync(path.join(ROOT, "testdata", name), "utf8");
  return createDom(html, url);
}

function runAdapter(dom, adapterFile, withBatch) {
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  runInWindow(dom, "src/lib/observe.js");
  runInWindow(dom, "src/lib/export.js");
  if (withBatch) runInWindow(dom, "src/lib/batch.js");
  dom.window.module = { exports: {} };
  runInWindow(dom, "src/content/" + adapterFile);
  return dom.window.module.exports;
}

test("htmlToMarkdown preserves headings and code", () => {
  const dom = createDom("<body><h1>Title</h1></body>");
  loadHtmlToMd(dom);
  const md = dom.window.MdToDocxHtml.htmlToMarkdown(
    "<h2>Hi</h2><pre><code class=\"language-js\">x</code></pre>"
  );
  assert.match(md, /## Hi/);
  assert.match(md, /```js/);
});

test("turnsToMarkdown formats user and assistant", () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  const md = dom.window.MdToDocxExtract.turnsToMarkdown(
    [
      { role: "user", markdown: "Hello" },
      { role: "assistant", markdown: "## Reply\n\nWorld" },
    ],
    "Demo"
  );
  assert.match(md, /^# Demo/m);
  assert.match(md, /### User/);
  assert.match(md, /### Assistant/);
  assert.match(md, /## Reply/);
});

test("chatgpt adapter extracts full conversation", () => {
  const dom = loadFixture("chatgpt-sample.html", "https://chatgpt.com/");
  const exports = runAdapter(dom, "chatgpt.js", true);
  const data = exports.extractConversationMarkdown(dom.window.document);
  assert.ok(data);
  assert.match(data.markdown, /### User/);
  assert.match(data.markdown, /### Assistant/);
  assert.match(data.markdown, /Sample Report/);
  assert.match(data.markdown, /test/);
  const latest = exports.extractLatestAssistantMarkdown(dom.window.document);
  assert.match(latest.markdown, /Sample Report/);
  const sidebar = exports.listSidebarConversations();
  assert.equal(sidebar.length, 2);
});

test("claude adapter extracts conversation", () => {
  const dom = loadFixture("claude-sample.html", "https://claude.ai/");
  const exports = runAdapter(dom, "claude.js", true);
  const data = exports.extractConversationMarkdown(dom.window.document);
  assert.ok(data);
  assert.match(data.markdown, /Design Doc/);
  assert.match(data.markdown, /Item one/);
  const sidebar = exports.listSidebarConversations();
  assert.ok(sidebar.length >= 2);
});

test("doubao adapter extracts flow-markdown-body conversation", () => {
  const dom = loadFixture("doubao-sample.html", "https://www.doubao.com/chat/");
  const exports = runAdapter(dom, "doubao.js", true);
  const data = exports.extractConversationMarkdown(dom.window.document);
  assert.ok(data);
  assert.match(data.markdown, /测试报告/);
  assert.match(data.markdown, /豆包/);
  assert.match(data.markdown, /```js/);
  const latest = exports.extractLatestAssistantMarkdown(dom.window.document);
  assert.match(latest.markdown, /测试报告/);
  const sidebar = exports.listSidebarConversations();
  assert.equal(sidebar.length, 2);
});

test("extractPageMarkdown prefers article", () => {
  const dom = createDom(
    "<body><nav>nav</nav><article><h1>A</h1><p>" +
      "word ".repeat(40) +
      "</p></article><footer>f</footer></body>"
  );
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  const md = dom.window.MdToDocxExtract.extractPageMarkdown(dom.window.document);
  assert.match(md, /# A|# A|A/);
  assert.doesNotMatch(md, /^nav$/m);
});

test("export labels switch with probe cache helper", async () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  let fetchCalls = 0;
  dom.window.fetch = async () => {
    fetchCalls += 1;
    return { ok: true };
  };
  runInWindow(dom, "src/lib/export.js");
  assert.equal(dom.window.MdToDocxExport.exportLabel(true), "Export to Word");
  assert.equal(dom.window.MdToDocxExport.exportLabel(false), "Export MD");
  const online = await dom.window.MdToDocxExport.probeEndpoint(true);
  assert.equal(online, true);
  assert.ok(fetchCalls >= 1);
});

test("htmlToMarkdown strips script content from flow", () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  const md = dom.window.MdToDocxHtml.htmlToMarkdown(
    "<p>Hello</p><script>alert(1)</script>"
  );
  assert.match(md, /Hello/);
  assert.doesNotMatch(md, /alert/);
});

test("htmlToMarkdown adds blank lines between div blocks", () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  const md = dom.window.MdToDocxHtml.htmlToMarkdown(
    "<div>First paragraph text here</div><div>Second paragraph text here</div>"
  );
  assert.match(md, /First paragraph text here\n\nSecond paragraph text here/);
});

test("beautifyMarkdown collapses excess blank lines", () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  const md = dom.window.MdToDocxHtml.beautifyMarkdown("A\n\n\n\nB\n## Title\nC");
  assert.doesNotMatch(md, /\n{3,}/);
  assert.match(md, /## Title/);
});

test("showFloating defaults to true", () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  runInWindow(dom, "src/lib/export.js");
  assert.equal(dom.window.MdToDocxExport.DEFAULTS.showFloating, true);
});

test("extractPageMarkdown strips nav from clone", () => {
  const dom = createDom(
    "<body><article><nav>SkipNav</nav><h1>Title</h1><div>Body text with enough characters to score. " +
      "word ".repeat(30) +
      "</div></article></body>"
  );
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  const md = dom.window.MdToDocxExtract.extractPageMarkdown(dom.window.document);
  assert.match(md, /Title/);
  assert.doesNotMatch(md, /SkipNav/);
});

test("floating button remounts after SPA removes it", async () => {
  const dom = createDom("<body><div id='app'>content</div></body>", "https://example.com", {
    realMutationObserver: true,
  });
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  runInWindow(dom, "src/lib/observe.js");
  runInWindow(dom, "src/lib/export.js");

  dom.window.MdToDocxExport.injectFloatingButton(() => {});
  await new Promise((r) => setTimeout(r, 30));

  let float = dom.window.document.querySelector(".md-to-docx-float");
  assert.ok(float, "float should mount initially");
  assert.equal(float.isConnected, true);

  float.remove();
  assert.equal(dom.window.document.querySelector(".md-to-docx-float"), null);

  await new Promise((r) => setTimeout(r, 250));

  float = dom.window.document.querySelector(".md-to-docx-float");
  assert.ok(float, "float should remount after SPA remove");
  assert.equal(float.isConnected, true);
  assert.ok(dom.window.document.body.contains(float));
});

test("observe runQuiet does not fire mutate callback", async () => {
  const dom = createDom("<body><div id='host'></div></body>", "https://example.com", {
    realMutationObserver: true,
  });
  runInWindow(dom, "src/lib/observe.js");
  let calls = 0;
  const host = dom.window.document.getElementById("host");
  const obs = dom.window.MdToDocxObserve.watch(
    host,
    () => {
      calls += 1;
    },
    { debounceMs: 50 }
  );
  obs.runQuiet(() => {
    const el = dom.window.document.createElement("div");
    el.textContent = "quiet";
    host.appendChild(el);
  });
  await new Promise((r) => setTimeout(r, 150));
  assert.equal(calls, 0);
  obs.disconnect();
});

test("observe ignores extension-only add mutations", () => {
  const dom = createDom("<body></body>");
  runInWindow(dom, "src/lib/observe.js");
  const own = dom.window.document.createElement("div");
  own.className = "md-to-docx-export-btn";
  const foreign = dom.window.document.createElement("div");
  foreign.className = "app-root";
  assert.equal(
    dom.window.MdToDocxObserve.shouldIgnoreMutations([
      { addedNodes: [own], removedNodes: [] },
    ]),
    true
  );
  assert.equal(
    dom.window.MdToDocxObserve.shouldIgnoreMutations([
      { addedNodes: [], removedNodes: [own] },
    ]),
    false
  );
  assert.equal(
    dom.window.MdToDocxObserve.shouldIgnoreMutations([
      { addedNodes: [foreign], removedNodes: [] },
    ]),
    false
  );
});

test("injectFloatingButton builds close icon without innerHTML", async () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  runInWindow(dom, "src/lib/observe.js");
  runInWindow(dom, "src/lib/export.js");

  dom.window.MdToDocxExport.injectFloatingButton(() => {});
  await new Promise((r) => setTimeout(r, 30));

  const close = dom.window.document.querySelector(".md-to-docx-float-sheet-close");
  assert.ok(close);
  const svg = close.querySelector("svg.md-to-docx-float-svg");
  assert.ok(svg);
  assert.ok(svg.querySelector("path"));
});

test("getSettings degrades when extension context is dead", async () => {
  const dom = createDom("<body></body>");
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  // No chrome.runtime.id → isExtensionAlive false
  dom.window.chrome = {
    storage: {
      sync: {
        get() {
          throw new Error("Extension context invalidated.");
        },
      },
      local: {
        get() {
          throw new Error("Extension context invalidated.");
        },
        set() {
          throw new Error("Extension context invalidated.");
        },
      },
    },
    runtime: {},
  };
  runInWindow(dom, "src/lib/export.js");
  assert.equal(dom.window.MdToDocxExport.isExtensionAlive(), false);
  const settings = await dom.window.MdToDocxExport.getSettings();
  assert.equal(settings.endpoint, "http://127.0.0.1:8080");
  assert.equal(settings.fallbackMd, true);
});

test("batch select panel lists sidebar chats and updates count", () => {
  const dom = loadFixture("chatgpt-sample.html", "https://chatgpt.com/");
  loadHtmlToMd(dom);
  runInWindow(dom, "src/lib/extract.js");
  runInWindow(dom, "src/lib/observe.js");
  runInWindow(dom, "src/lib/export.js");
  runInWindow(dom, "src/lib/batch.js");
  dom.window.module = { exports: {} };
  runInWindow(dom, "src/content/chatgpt.js");
  const adapter = dom.window.module.exports;

  const api = dom.window.MdToDocxBatch.setupBatchExport({
    listSidebarConversations: adapter.listSidebarConversations,
    openConversation: async () => {},
    extractConversationMarkdown: adapter.extractConversationMarkdown,
    isConversationReady: () => true,
  });

  assert.ok(dom.window.document.querySelector(".md-to-docx-batch-float"));
  assert.ok(dom.window.document.querySelector(".md-to-docx-batch-launcher"));
  assert.match(
    dom.window.document.querySelector(".md-to-docx-batch-hint").textContent,
    /Select chats/
  );

  const launcher = dom.window.document.querySelector(".md-to-docx-batch-launcher");
  assert.match(launcher.title, /drag to move/);
  launcher.click();
  assert.ok(
    dom.window.document
      .querySelector(".md-to-docx-batch-float")
      .classList.contains("md-to-docx-batch-float-open")
  );

  api.openPanel();
  const panel = dom.window.document.querySelector(".md-to-docx-batch-panel");
  assert.ok(panel);
  assert.equal(panel.hidden, false);

  const rows = panel.querySelectorAll(".md-to-docx-batch-row");
  assert.equal(rows.length, 2);
  assert.match(rows[0].textContent, /Alpha chat/);
  assert.match(rows[1].textContent, /Beta chat/);

  const cb = rows[0].querySelector("input[type=checkbox]");
  cb.checked = true;
  cb.dispatchEvent(new dom.window.Event("change", { bubbles: true }));

  assert.equal(api.getSelected().length, 1);
  assert.equal(
    dom.window.document.querySelector(".md-to-docx-batch-count").textContent,
    "1"
  );
  assert.equal(
    dom.window.document.querySelector(".md-to-docx-batch-export").disabled,
    false
  );
  const pill = dom.window.document.querySelector(".md-to-docx-batch-count-pill");
  assert.equal(pill.hidden, false);
  assert.equal(pill.textContent, "1");
});

test("gemini adapter interleaves user and assistant turns", () => {
  const dom = loadFixture("gemini-sample.html", "https://gemini.google.com/");
  const exports = runAdapter(dom, "gemini.js", false);
  const data = exports.extractConversationMarkdown(dom.window.document);
  assert.ok(data);
  const md = data.markdown;
  const userIdx1 = md.indexOf("First question");
  const asstIdx1 = md.indexOf("First answer");
  const userIdx2 = md.indexOf("Second question");
  const asstIdx2 = md.indexOf("Second answer");
  assert.ok(userIdx1 >= 0 && asstIdx1 > userIdx1);
  assert.ok(userIdx2 > asstIdx1 && asstIdx2 > userIdx2);
  // Must not dump all users before all assistants
  assert.ok(asstIdx1 < userIdx2);
});
