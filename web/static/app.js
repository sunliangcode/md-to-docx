(function () {
  const markdownEl = document.getElementById("markdown");
  const previewEl = document.getElementById("preview");
  const presetEl = document.getElementById("preset");
  const batchPresetEl = document.getElementById("batch-preset");
  const tocEl = document.getElementById("toc");
  const numberingEl = document.getElementById("numbering");
  const pageNumbersEl = document.getElementById("page-numbers");
  const exampleEl = document.getElementById("example");
  const generateBtn = document.getElementById("generate");
  const validateBtn = document.getElementById("validate");
  const copyCliBtn = document.getElementById("copy-cli");
  const errorEl = document.getElementById("error");
  const errorProblem = document.getElementById("error-problem");
  const errorCause = document.getElementById("error-cause");
  const errorFix = document.getElementById("error-fix");
  const errorDismiss = document.getElementById("error-dismiss");
  const errorRetry = document.getElementById("error-retry");
  const charCountEl = document.getElementById("char-count");
  const toastEl = document.getElementById("toast");
  const presetHintEl = document.getElementById("preset-hint");
  const previewPresetEl = document.getElementById("preview-preset");
  const langEnBtn = document.getElementById("lang-en");
  const langZhBtn = document.getElementById("lang-zh");
  const optionsPanel = document.getElementById("options-panel");
  const toggleOptions = document.getElementById("toggle-options");
  const templateEl = document.getElementById("community-template");
  const templateFileEl = document.getElementById("template-file");
  const titleEl = document.getElementById("doc-title");
  const authorEl = document.getElementById("doc-author");
  const dateEl = document.getElementById("doc-date");
  const versionEl = document.getElementById("doc-version");
  const tocTitleEl = document.getElementById("toc-title");
  const figureLabelEl = document.getElementById("figure-label");
  const tableLabelEl = document.getElementById("table-label");
  const sectionLabelEl = document.getElementById("section-label");
  const normalizeEl = document.getElementById("normalize");
  const noPluginsEl = document.getElementById("no-plugins");
  const strictMermaidEl = document.getElementById("strict-mermaid");
  const validateStrictEl = document.getElementById("validate-strict");
  const validatePanel = document.getElementById("validate-panel");
  const validateList = document.getElementById("validate-list");
  const validateMeta = document.getElementById("validate-meta");
  const convertPaneUpload = document.getElementById("convert-pane-upload");
  const convertPaneEditor = document.getElementById("convert-pane-editor");
  const convertDropzone = document.getElementById("convert-dropzone");
  const convertFile = document.getElementById("convert-file");
  const reverseFile = document.getElementById("reverse-file");
  const reverseDropzone = document.getElementById("reverse-dropzone");
  const reverseFileName = document.getElementById("reverse-file-name");
  const reverseOut = document.getElementById("reverse-out");
  const reverseEmpty = document.getElementById("reverse-empty");
  const runReverse = document.getElementById("run-reverse");
  const sendToConvert = document.getElementById("send-to-convert");
  const copyReverseMd = document.getElementById("copy-reverse-md");
  const downloadReverseMd = document.getElementById("download-reverse-md");
  const reverseClear = document.getElementById("reverse-clear");
  const reverseMeta = document.getElementById("reverse-meta");
  const copyCliReverse = document.getElementById("copy-cli-reverse");
  const diffA = document.getElementById("diff-a");
  const diffB = document.getElementById("diff-b");
  const diffOut = document.getElementById("diff-out");
  const diffFormat = document.getElementById("diff-format");
  const runDiff = document.getElementById("run-diff");
  const loadDiffSample = document.getElementById("load-diff-sample");
  const copyCliDiff = document.getElementById("copy-cli-diff");
  const diffFileA = document.getElementById("diff-file-a");
  const diffFileB = document.getElementById("diff-file-b");
  const diffDropA = document.getElementById("diff-drop-a");
  const diffDropB = document.getElementById("diff-drop-b");
  const diffFileAName = document.getElementById("diff-file-a-name");
  const diffFileBName = document.getElementById("diff-file-b-name");
  const diffOptionsPanel = document.getElementById("diff-options-panel");
  const toggleDiffOptions = document.getElementById("toggle-diff-options");
  const batchDropzone = document.getElementById("batch-dropzone");
  const batchFilesInput = document.getElementById("batch-files");
  const batchFileList = document.getElementById("batch-file-list");
  const batchOut = document.getElementById("batch-out");
  const batchClear = document.getElementById("batch-clear");
  const runBatch = document.getElementById("run-batch");
  const batchDryRun = document.getElementById("batch-dry-run");
  const copyCliBatch = document.getElementById("copy-cli-batch");
  const batchOptionsPanel = document.getElementById("batch-options-panel");
  const toggleBatchOptions = document.getElementById("toggle-batch-options");
  const batchExclude = document.getElementById("batch-exclude");
  const batchSkipExisting = document.getElementById("batch-skip-existing");
  const batchToc = document.getElementById("batch-toc");
  const batchNumbering = document.getElementById("batch-numbering");
  const batchPageNumbers = document.getElementById("batch-page-numbers");
  const batchNormalize = document.getElementById("batch-normalize");
  const batchTemplate = document.getElementById("batch-template");
  const batchTemplateFile = document.getElementById("batch-template-file");

  const SNIPPETS = {
    frontmatter: "---\ntitle: Playground sample\nauthor: Demo\ndate: 2026-09-03\n---\n\n",
    callout: ":::warning\nImportant caution text.\n:::\n\n",
    pagebreak: "<!-- pagebreak -->\n\n",
    caption: "![Architecture](https://placehold.co/640x240/png){#fig:arch}\n\nSee [@fig:arch].\n\n",
    mermaid: "```mermaid\nflowchart LR\n  A[Markdown] --> B[DOCX]\n```\n\n",
    math: "Inline $E = mc^2$ and a block:\n\n$$\n\\int_0^1 x^2 \\, dx\n$$\n\n",
  };

  const DIFF_SAMPLE_A = "# Status\n\nShip the compiler.\n\n## Scope\n\nConvert Markdown to DOCX.\n";
  const DIFF_SAMPLE_B = "# Status\n\nShip the native compiler.\n\n## Scope\n\nConvert Markdown to DOCX and reverse it.\n\n:::note\nDiff is structural, not a word-level redline.\n:::\n";

  let debounceTimer;
  let toastTimer;
  let previewSeq = 0;
  let previewAbort = null;
  let lastPreviewKey = "";
  let presetsCache = [];
  let currentMode = "convert";
  let convertInputMode = "upload";
  let diffInputMode = "upload";
  let optionsOpen = false;
  let batchOptionsOpen = false;
  let diffOptionsOpen = false;
  let batchItems = []; // { file, name, kind: 'md'|'zip' }
  let currentLang =
    localStorage.getItem("md-to-docx-lang") ||
    (navigator.language.startsWith("zh") ? "zh" : "en");
  let lastErrorDetail = null;

  const FONT_FALLBACKS = {
    Calibri: "Calibri, sans-serif",
    Georgia: "Georgia, serif",
    "Times New Roman": '"Times New Roman", Times, serif',
    "Microsoft YaHei": '"Microsoft YaHei", "PingFang SC", sans-serif',
    SimSun: "SimSun, STSong, serif",
    KaiTi: "KaiTi, STKaiti, serif",
  };

  function messages() {
    return window.MD_TO_DOCX_I18N[currentLang] || window.MD_TO_DOCX_I18N.en;
  }

  function t(key, vars) {
    const m = messages();
    let text = m[key];
    if (text === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.replace("{" + k + "}", vars[k]);
      });
    }
    return text;
  }

  function presetDescription(name) {
    const desc = messages().presetDescriptions[name];
    return desc || name;
  }

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  function shortcutModLabel() {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    if (/Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X/i.test(ua)) return "⌘";
    return "Ctrl+";
  }

  function applyShortcutHints() {
    const mod = shortcutModLabel();
    const label = t("shortcutRun", { mod: mod });
    const title = t("shortcutRunTitle", { mod: mod });
    [
      ["generate-kbd", generateBtn],
      ["run-batch-kbd", runBatch],
      ["run-reverse-kbd", runReverse],
      ["run-diff-kbd", runDiff],
    ].forEach(function (pair) {
      const kbd = document.getElementById(pair[0]);
      if (kbd) kbd.textContent = label;
      if (pair[1]) pair[1].title = title;
    });
  }

  function previewSkeletonHtml() {
    return (
      '<div class="skeleton" aria-hidden="true">' +
      '<div class="skeleton__line skeleton__line--lg"></div>' +
      '<div class="skeleton__line"></div>' +
      '<div class="skeleton__line"></div>' +
      '<div class="skeleton__line skeleton__line--short"></div>' +
      '<div class="skeleton__line"></div>' +
      '<div class="skeleton__line skeleton__line--med"></div>' +
      "</div>"
    );
  }

  function previewFontFamily(latin, eastAsia) {
    const latinStack = FONT_FALLBACKS[latin] || latin + ", sans-serif";
    const eastStack = FONT_FALLBACKS[eastAsia] || eastAsia + ", sans-serif";
    return latinStack + ", " + eastStack;
  }

  function getPresetByName(name) {
    return presetsCache.find(function (p) {
      return p.name === name;
    });
  }

  function localizeValidationCause(cause) {
    let text = String(cause || "");
    if (currentLang === "zh") {
      text = text
        .replace(/Field required/g, "必填")
        .replace(/value is not a valid/gi, "值无效")
        .replace(/Input should be/gi, "应为")
        .replace(/String should have at least/gi, "至少需要");
    }
    return text;
  }

  function parseError(res, json) {
    const detail = (json && (json.detail || json)) || {};
    if (typeof detail === "string") {
      return {
        problem: t("errorRequestFailed"),
        cause: detail,
        fix: t("errorTryAgain"),
      };
    }
    if (Array.isArray(detail)) {
      return {
        problem: t("errorInvalidRequest"),
        cause: localizeValidationCause(
          detail
            .slice(0, 5)
            .map(function (e) {
              if (!e || typeof e !== "object") return String(e);
              const loc = (e.loc || []).filter(function (x) { return x !== "body"; }).join(".");
              return loc ? loc + ": " + (e.msg || "invalid") : (e.msg || JSON.stringify(e));
            })
            .join("; ")
        ),
        fix: t("errorInvalidRequestFix"),
      };
    }
    const status = res && res.status;
    if (status === 422 || detail.problem === "Invalid request") {
      return {
        problem: t("errorInvalidRequest"),
        cause: localizeValidationCause(detail.cause || res.statusText || String(status)),
        fix: detail.fix && detail.fix !== "Check the highlighted fields and try again"
          ? detail.fix
          : t("errorInvalidRequestFix"),
      };
    }
    if (status === 429 || status === 503) {
      return {
        problem: t("errorServerBusy"),
        cause: detail.cause || res.statusText || String(status),
        fix: t("errorServerBusyFix"),
      };
    }
    return {
      problem: detail.problem || t("errorRequestFailed"),
      cause: detail.cause || res.statusText || String(res.status),
      fix: detail.fix || t("errorTryAgain"),
    };
  }

  function networkErrorDetail(err) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return {
        problem: t("errorOffline"),
        cause: t("errorOfflineCause"),
        fix: t("errorOfflineFix"),
      };
    }
    return {
      problem: t("errorNetwork"),
      cause: err ? String(err.message || err) : "",
      fix: t("errorNetworkFix"),
    };
  }

  function syncOfflineBanner() {
    const banner = document.getElementById("offline-banner");
    if (!banner) return;
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    banner.hidden = !offline;
    banner.classList.toggle("hidden", !offline);
    if (offline) banner.textContent = t("errorOfflineBanner");
  }

  function setConvertInputMode(mode) {
    convertInputMode = mode;
    document.querySelectorAll("#convert-input-mode .segmented__btn").forEach(function (btn) {
      const on = btn.getAttribute("data-input-mode") === mode;
      btn.classList.toggle("segmented__btn--active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    syncRovingTabindex(
      document.getElementById("convert-input-mode"),
      ".segmented__btn",
      "data-input-mode",
      mode
    );
    const isUpload = mode === "upload";
    convertPaneUpload.classList.toggle("hidden", !isUpload);
    convertPaneEditor.classList.toggle("hidden", isUpload);
    if (!isUpload) {
      schedulePreview();
      // Focus after layout so paste mode feels instant (Linear/Notion pattern).
      requestAnimationFrame(function () {
        markdownEl.focus({ preventScroll: true });
      });
    }
    syncPanelInert();
    syncPrimaryActions();
  }

  function setDiffInputMode(mode) {
    diffInputMode = mode;
    document.querySelectorAll("#diff-input-mode .segmented__btn").forEach(function (btn) {
      const on = btn.getAttribute("data-diff-mode") === mode;
      btn.classList.toggle("segmented__btn--active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    syncRovingTabindex(
      document.getElementById("diff-input-mode"),
      ".segmented__btn",
      "data-diff-mode",
      mode
    );
    const isUpload = mode === "upload";
    diffDropA.classList.toggle("hidden", !isUpload);
    diffDropB.classList.toggle("hidden", !isUpload);
    diffA.classList.toggle("hidden", isUpload);
    diffB.classList.toggle("hidden", isUpload);
    syncPanelInert();
    syncPrimaryActions();
  }

  function syncPanelInert() {
    document.querySelectorAll("[data-mode-panel]").forEach(function (el) {
      const visible = !el.classList.contains("hidden") && !el.hidden;
      if (visible) el.removeAttribute("inert");
      else el.setAttribute("inert", "");
    });
  }

  function setMode(mode) {
    const prevMode = currentMode;
    currentMode = mode;
    document.querySelectorAll(".mode-nav__btn").forEach(function (btn) {
      const on = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("mode-nav__btn--active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    syncRovingTabindex(document.querySelector(".mode-nav"), ".mode-nav__btn", "data-mode", mode);
    document.querySelectorAll("[data-mode-panel]").forEach(function (el) {
      const on = el.getAttribute("data-mode-panel") === mode;
      el.classList.toggle("hidden", !on);
      if (el.hasAttribute("hidden") || el.tagName === "MAIN" || el.classList.contains("workspace")) {
        el.hidden = !on;
      }
    });
    document.querySelector(".skip-link").setAttribute("href", "#workspace-" + mode);
    showError(null);

    if (mode === "convert") {
      if (!optionsOpen) optionsPanel.classList.add("hidden");
      if (!validateList.children.length) validatePanel.classList.add("hidden");
      setConvertInputMode(convertInputMode);
      if (convertInputMode === "paste") schedulePreview();
    }
    if (mode === "batch") {
      if (!batchOptionsOpen) batchOptionsPanel.classList.add("hidden");
      if (!batchOut.textContent.trim() || batchOut.dataset.empty === "1") {
        setPanelEmpty(batchOut, "batchEmpty", "batchEmptyTitle");
      }
    }
    if (mode === "diff") {
      if (!diffOptionsOpen) diffOptionsPanel.classList.add("hidden");
      setDiffInputMode(diffInputMode);
      if (!diffOut.textContent.trim() || diffOut.dataset.empty === "1") {
        setPanelEmpty(diffOut, "diffEmpty", "diffEmptyTitle");
      }
    }
    if (mode === "reverse") {
      syncReverseResultView();
    }
    syncPanelInert();
    const ae = document.activeElement;
    if (ae && ae.closest && ae.closest("[inert]")) {
      const activeBtn = document.querySelector('.mode-nav__btn[data-mode="' + mode + '"]');
      if (activeBtn) {
        try {
          activeBtn.focus({ preventScroll: true });
        } catch (_) {
          activeBtn.focus();
        }
      }
    }
    syncDocumentTitle();
    if (prevMode !== mode) announceMode(mode);
    syncPrimaryActions();
  }

  function announceMode(mode) {
    const live = document.getElementById("status-live");
    if (!live) return;
    const modeKeys = {
      convert: "modeConvert",
      batch: "modeBatch",
      reverse: "modeReverse",
      diff: "modeDiff",
    };
    live.textContent = t("statusModeChanged", { mode: t(modeKeys[mode] || "modeConvert") });
  }

  function syncDocumentTitle() {
    const modeKeys = {
      convert: "modeConvert",
      batch: "modeBatch",
      reverse: "modeReverse",
      diff: "modeDiff",
    };
    document.title = t("pageTitle") + " · " + t(modeKeys[currentMode] || "modeConvert");
  }

  function setText(id, key) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  function applyI18n() {
    syncDocumentTitle();
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
    const skip = document.querySelector(".skip-link");
    if (skip) skip.textContent = t("skipLink");
    if (errorRetry) errorRetry.textContent = t("btnRetry");
    setText("open-shortcuts", "btnShortcuts");
    [
      optionsPanel,
      batchOptionsPanel,
      diffOptionsPanel,
    ].forEach(function (panel) {
      if (panel) panel.setAttribute("aria-label", t("optionsRegionLabel"));
    });
    renderShortcutsList();
    const shortcutsTitle = document.getElementById("shortcuts-title");
    const shortcutsHint = document.getElementById("shortcuts-hint");
    const shortcutsClose = document.getElementById("shortcuts-close");
    if (shortcutsTitle) shortcutsTitle.textContent = t("shortcutsTitle");
    if (shortcutsHint) shortcutsHint.textContent = t("shortcutsHint");
    if (shortcutsClose) shortcutsClose.setAttribute("aria-label", t("shortcutsClose"));

    setText("i18n-header-hint", "headerHint");
    document.getElementById("lang-switch").setAttribute("aria-label", t("langLabel"));
    document.querySelector(".mode-nav").setAttribute("aria-label", t("modeNavLabel"));
    document.getElementById("convert-input-mode").setAttribute("aria-label", t("inputModeLabel"));
    document.getElementById("diff-input-mode").setAttribute("aria-label", t("diffInputLabel"));
    setText("mode-convert", "modeConvert");
    setText("mode-batch", "modeBatch");
    setText("mode-reverse", "modeReverse");
    setText("mode-diff", "modeDiff");
    setText("input-mode-upload", "inputUpload");
    setText("input-mode-paste", "inputPaste");
    setText("diff-mode-upload", "inputUpload");
    setText("diff-mode-paste", "inputPaste");
    setText("i18n-label-example", "labelExample");
    setText("i18n-label-preset", "labelPreset");
    setText("i18n-label-batch-preset", "labelPreset");
    setText("i18n-label-toc", "labelToc");
    setText("i18n-label-numbering", "labelNumbering");
    setText("i18n-label-title", "labelTitle");
    setText("i18n-label-author", "labelAuthor");
    setText("i18n-label-date", "labelDate");
    setText("i18n-label-version", "labelVersion");
    setText("i18n-label-toc-title", "labelTocTitle");
    setText("i18n-label-figure", "labelFigure");
    setText("i18n-label-table", "labelTable");
    setText("i18n-label-section", "labelSection");
    setText("i18n-label-normalize", "labelNormalize");
    setText("i18n-label-no-plugins", "labelNoPlugins");
    setText("i18n-label-strict-mermaid", "labelStrictMermaid");
    setText("i18n-label-validate-strict", "labelValidateStrict");
    setText("i18n-label-template", "labelTemplate");
    setText("i18n-label-template-upload", "labelTemplateUpload");
    setText("i18n-template-none", "templateNone");
    setText("i18n-batch-template-none", "templateNone");
    setText("i18n-label-page-numbers", "labelPageNumbers");
    setText("i18n-opt-doc", "optDoc");
    setText("i18n-opt-structure", "optStructure");
    setText("i18n-opt-captions", "optCaptions");
    setText("i18n-opt-behavior", "optBehavior");
    setText("i18n-opt-template", "optTemplate");
    setText("i18n-snippets-label", "snippetsLabel");
    setText("i18n-example-placeholder", "examplePlaceholder");
    setText("i18n-pane-upload", "paneUpload");
    setText("i18n-pane-markdown", "paneMarkdown");
    setText("i18n-pane-preview", "panePreview");
    setText("i18n-badge-approx", "badgeApproximation");
    setText("i18n-footer-privacy", "footerPrivacy");
    setText("i18n-label-diff-format", "labelDiffFormat");
    setText("i18n-pane-reverse-in", "paneReverseIn");
    setText("i18n-pane-reverse-out", "paneReverseOut");
    setText("i18n-pane-diff-a", "paneDiffA");
    setText("i18n-pane-diff-b", "paneDiffB");
    setText("i18n-pane-diff-out", "paneDiffOut");
    setText("i18n-pane-batch-in", "paneBatchIn");
    setText("i18n-pane-batch-out", "paneBatchOut");
    setText("i18n-convert-drop-title", "convertDropTitle");
    setText("i18n-convert-drop-hint", "convertDropHint");
    setText("convert-pick-file", "dropChooseFile");
    setText("convert-try-example", "dropTryExample");
    setText("convert-switch-paste", "dropSwitchPaste");
    setText("i18n-batch-drop-title", "batchDropTitle");
    setText("i18n-batch-drop-hint", "batchDropHint");
    setText("batch-pick-files", "dropChooseFiles");
    setText("i18n-reverse-drop-title", "reverseDropTitle");
    setText("i18n-reverse-empty", "reverseEmpty");
    setText("reverse-pick-file", "dropChooseDocx");
    setText("download-reverse-md", "btnDownloadMd");
    if (reverseClear) reverseClear.textContent = t("btnClear");
    setText("i18n-diff-drop-a", "diffDropA");
    setText("i18n-diff-drop-b", "diffDropB");
    setText("i18n-diff-drop-hint-a", "diffDropHint");
    setText("i18n-diff-drop-hint-b", "diffDropHint");
    setText("diff-pick-a", "dropChooseFile");
    setText("diff-pick-b", "dropChooseFile");
    setText("i18n-validate-title", "validateTitle");
    setText("i18n-label-exclude", "labelExclude");
    setText("i18n-label-skip-existing", "labelSkipExisting");
    setText("i18n-batch-opt-rules", "batchOptRules");
    setText("i18n-batch-opt-style", "batchOptStyle");
    setText("i18n-label-batch-toc", "labelToc");
    setText("i18n-label-batch-numbering", "labelNumbering");
    setText("i18n-label-batch-page-numbers", "labelPageNumbers");
    setText("i18n-label-batch-normalize", "labelNormalize");
    setText("i18n-label-batch-template", "labelTemplate");
    setText("i18n-label-batch-template-upload", "labelTemplateUpload");

    markdownEl.placeholder = t("placeholderMarkdown");
    reverseOut.placeholder = t("placeholderReverse");
    diffA.placeholder = t("diffEmpty");
    diffB.placeholder = t("diffEmpty");
    if (!diffOut.textContent.trim() || diffOut.dataset.empty === "1") {
      setPanelEmpty(diffOut, "diffEmpty", "diffEmptyTitle");
    }
    if (!batchOut.textContent.trim() || batchOut.dataset.empty === "1") {
      setPanelEmpty(batchOut, "batchEmpty", "batchEmptyTitle");
    }
    syncReverseResultView();
    syncOfflineBanner();

    toggleOptions.textContent = optionsOpen ? t("btnOptionsHide") : t("btnOptions");
    toggleBatchOptions.textContent = batchOptionsOpen ? t("btnOptionsHide") : t("btnOptions");
    toggleDiffOptions.textContent = diffOptionsOpen ? t("btnOptionsHide") : t("btnOptions");
    copyCliBtn.textContent = t("btnCopyCli");
    copyCliReverse.textContent = t("btnCopyCli");
    copyCliDiff.textContent = t("btnCopyCli");
    copyCliBatch.textContent = t("btnCopyCli");
    sendToConvert.textContent = t("btnSendConvert");
    copyReverseMd.textContent = t("btnCopy");
    loadDiffSample.textContent = t("btnLoadSample");
    batchClear.textContent = t("btnClear");

    if (!generateBtn.classList.contains("btn--loading")) {
      generateBtn.querySelector(".btn__label").textContent = t("btnExport");
    }
    if (!validateBtn.classList.contains("btn--loading")) {
      validateBtn.querySelector(".btn__label").textContent = t("btnValidate");
    }
    if (!runReverse.classList.contains("btn--loading")) {
      runReverse.querySelector(".btn__label").textContent = t("btnReverse");
    }
    if (!runDiff.classList.contains("btn--loading")) {
      runDiff.querySelector(".btn__label").textContent = t("btnDiff");
    }
    if (!runBatch.classList.contains("btn--loading")) {
      runBatch.querySelector(".btn__label").textContent = t("btnBatch");
    }
    if (!batchDryRun.classList.contains("btn--loading")) {
      batchDryRun.querySelector(".btn__label").textContent = t("btnDryRun");
    }
    errorDismiss.setAttribute("aria-label", t("errorDismiss"));
    applyShortcutHints();
    [
      [convertDropzone, "convertDropTitle"],
      [batchDropzone, "batchDropTitle"],
      [reverseDropzone, "reverseDropTitle"],
      [diffDropA, "diffDropA"],
      [diffDropB, "diffDropB"],
    ].forEach(function (pair) {
      if (pair[0]) pair[0].setAttribute("aria-label", t(pair[1]));
    });

    langEnBtn.classList.toggle("lang-switch__btn--active", currentLang === "en");
    langZhBtn.classList.toggle("lang-switch__btn--active", currentLang === "zh");
    langEnBtn.setAttribute("aria-pressed", currentLang === "en" ? "true" : "false");
    langZhBtn.setAttribute("aria-pressed", currentLang === "zh" ? "true" : "false");

    exampleEl.querySelectorAll("option[data-example-key]").forEach(function (opt) {
      const key = opt.getAttribute("data-example-key");
      opt.textContent = messages().exampleOptions[key] || key;
    });

    document.querySelectorAll("[data-snippet]").forEach(function (btn) {
      const key = btn.getAttribute("data-snippet");
      const map = {
        frontmatter: "snippetFrontmatter",
        callout: "snippetCallout",
        pagebreak: "snippetPagebreak",
        caption: "snippetCaption",
        mermaid: "snippetMermaid",
        math: "snippetMath",
      };
      btn.textContent = t(map[key]);
    });

    rebuildPresetOptions();
    if (lastErrorDetail) showError(lastErrorDetail);
    if (presetEl.value) applyPresetUi(presetEl.value, false);
    if (batchPresetEl.value) applyBatchPresetUi(batchPresetEl.value, false);
    if (currentMode === "convert" && convertInputMode === "paste") schedulePreview();
    syncPrimaryActions();
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("md-to-docx-lang", lang);
    applyI18n();
  }

  function fillPresetSelect(selectEl, selected) {
    selectEl.innerHTML = "";
    presetsCache.forEach(function (p) {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name + " — " + presetDescription(p.name);
      selectEl.appendChild(opt);
    });
    if (selected && presetsCache.some(function (p) { return p.name === selected; })) {
      selectEl.value = selected;
    }
  }

  function rebuildPresetOptions() {
    fillPresetSelect(presetEl, presetEl.value || "technical");
    fillPresetSelect(batchPresetEl, batchPresetEl.value || "technical");
  }

  function applyPresetUi(name, syncChecks) {
    const preset = getPresetByName(name);
    if (!preset) return;

    if (syncChecks !== false) {
      tocEl.checked = preset.toc;
      numberingEl.checked = preset.numbering;
    }

    previewPresetEl.textContent = preset.name;

    const pv = preset.preview || {};
    const latin = pv.latin || "Calibri";
    const eastAsia = pv.east_asia || "Microsoft YaHei";
    const bodyPt = pv.body_pt || 11;
    const headingColor = pv.heading_color || "#111827";

    previewEl.style.setProperty("--preview-font-body", previewFontFamily(latin, eastAsia));
    previewEl.style.setProperty("--preview-body-pt", bodyPt + "px");
    previewEl.style.setProperty("--preview-heading-color", headingColor);

    const parts = [
      preset.name,
      t("presetHintFonts", { latin: latin, east_asia: eastAsia, pt: String(bodyPt) }),
      tocEl.checked ? t("presetHintTocOn") : t("presetHintTocOff"),
      numberingEl.checked ? t("presetHintNumberingOn") : t("presetHintNumberingOff"),
    ];
    if (pv.header) parts.push(t("presetHintHeader", { header: pv.header }));
    presetHintEl.textContent = parts.join(" · ");
  }

  function applyBatchPresetUi(name, syncChecks) {
    const preset = getPresetByName(name);
    if (!preset) return;
    if (syncChecks !== false) {
      batchToc.checked = preset.toc;
      batchNumbering.checked = preset.numbering;
    }
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  let shortcutsOpen = false;
  let shortcutsReturnFocus = null;

  function shortcutsEntries() {
    const mod = shortcutModLabel();
    return [
      { keys: [mod + "Enter"], label: t("shortcutRunAction") },
      { keys: ["Esc"], label: t("shortcutEscape") },
      { keys: ["?"], label: t("shortcutShortcuts") },
      { keys: [mod + "/"], label: t("shortcutShortcuts") },
      { keys: ["←", "→"], label: t("shortcutModeNav") },
    ];
  }

  function renderShortcutsList() {
    const list = document.getElementById("shortcuts-list");
    if (!list) return;
    list.innerHTML = "";
    shortcutsEntries().forEach(function (entry) {
      const li = document.createElement("li");
      li.className = "shortcuts-dialog__row";
      const label = document.createElement("span");
      label.textContent = entry.label;
      const keys = document.createElement("span");
      keys.className = "shortcuts-dialog__keys";
      entry.keys.forEach(function (k) {
        const kbd = document.createElement("kbd");
        kbd.className = "shortcuts-dialog__key";
        kbd.textContent = k;
        keys.appendChild(kbd);
      });
      li.appendChild(label);
      li.appendChild(keys);
      list.appendChild(li);
    });
  }

  function openShortcuts() {
    const dialog = document.getElementById("shortcuts-dialog");
    if (!dialog || shortcutsOpen) return;
    shortcutsOpen = true;
    shortcutsReturnFocus = document.activeElement;
    renderShortcutsList();
    dialog.hidden = false;
    dialog.classList.remove("hidden");
    document.body.classList.add("app--dialog-open");
    const closeBtn = document.getElementById("shortcuts-close");
    if (closeBtn) {
      try {
        closeBtn.focus({ preventScroll: true });
      } catch (_) {
        closeBtn.focus();
      }
    }
  }

  function closeShortcuts() {
    const dialog = document.getElementById("shortcuts-dialog");
    if (!dialog || !shortcutsOpen) return;
    shortcutsOpen = false;
    dialog.hidden = true;
    dialog.classList.add("hidden");
    document.body.classList.remove("app--dialog-open");
    if (shortcutsReturnFocus && typeof shortcutsReturnFocus.focus === "function") {
      try {
        shortcutsReturnFocus.focus({ preventScroll: true });
      } catch (_) {
        shortcutsReturnFocus.focus();
      }
    }
    shortcutsReturnFocus = null;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    if (prefersReducedMotion()) {
      toastEl.classList.add("toast--visible");
      toastTimer = setTimeout(function () {
        toastEl.classList.remove("toast--visible");
        toastEl.classList.add("hidden");
      }, 2200);
      return;
    }
    // Force reflow so repeated toasts still animate.
    void toastEl.offsetWidth;
    toastEl.classList.add("toast--visible");
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--visible");
      toastTimer = setTimeout(function () {
        toastEl.classList.add("hidden");
      }, 280);
    }, 2800);
  }

  function showError(detail) {
    lastErrorDetail = detail;
    if (!detail) {
      errorEl.classList.add("hidden");
      errorProblem.textContent = "";
      errorCause.textContent = "";
      errorFix.textContent = "";
      return;
    }
    errorProblem.textContent = detail.problem ? detail.problem : "";
    errorCause.textContent = detail.cause ? t("errorCause") + detail.cause : "";
    errorFix.textContent = detail.fix ? t("errorFix") + detail.fix : "";
    errorEl.classList.remove("hidden");
    errorEl.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
    });
    try {
      errorDismiss.focus({ preventScroll: true });
    } catch (_) {
      errorDismiss.focus();
    }
  }

  function setBtnLoading(btn, loading, idleKey, loadingKey) {
    btn.classList.toggle("btn--loading", loading);
    btn.setAttribute("aria-busy", loading ? "true" : "false");
    const label = btn.querySelector(".btn__label");
    if (label) label.textContent = loading ? t(loadingKey) : t(idleKey);
    const kbd = btn.querySelector(".btn__kbd");
    if (kbd) kbd.hidden = !!loading;
    syncPrimaryActions();
  }

  function isLoading(btn) {
    return btn && btn.classList.contains("btn--loading");
  }

  function setActionEnabled(btn, ready, needKey) {
    if (!btn) return;
    const loading = isLoading(btn);
    const enabled = ready && !loading;
    btn.disabled = !enabled;
    if (!ready && needKey) {
      btn.title = t(needKey);
    } else if (!loading) {
      // Restore shortcut title for primary run buttons.
      const kbd = btn.querySelector(".btn__kbd");
      if (kbd) btn.title = t("shortcutRunTitle", { mod: shortcutModLabel() });
      else btn.removeAttribute("title");
    }
  }

  function syncPrimaryActions() {
    const mdReady = !!markdownEl.value.trim();
    const mdBytes = new TextEncoder().encode(markdownEl.value).length;
    const mdUnderLimit = mdBytes <= 400 * 1024;
    setActionEnabled(generateBtn, mdReady && mdUnderLimit, mdReady && !mdUnderLimit ? "actionMdTooLarge" : "actionNeedMd");
    setActionEnabled(validateBtn, mdReady, "actionNeedMd");

    const batchReady = batchItems.length > 0;
    setActionEnabled(runBatch, batchReady, "actionNeedBatch");
    setActionEnabled(batchDryRun, batchReady, "actionNeedBatch");

    const reverseReady = !!(reverseFile.files && reverseFile.files[0]);
    setActionEnabled(runReverse, reverseReady, "actionNeedDocx");

    let diffReady = false;
    if (diffInputMode === "upload") {
      diffReady = !!(diffFileA.files && diffFileA.files[0] && diffFileB.files && diffFileB.files[0]);
    } else {
      diffReady = !!(diffA.value.trim() || diffB.value.trim());
    }
    setActionEnabled(runDiff, diffReady, "actionNeedDiff");

    const reverseHasOut = !!reverseOut.value.trim();
    sendToConvert.disabled = !reverseHasOut;
    copyReverseMd.disabled = !reverseHasOut;
    if (downloadReverseMd) downloadReverseMd.disabled = !reverseHasOut;
  }

  function downloadTextFile(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function updateReverseMeta() {
    const text = reverseOut.value || "";
    if (!text.trim()) {
      setResultMeta(reverseMeta, "");
      return;
    }
    const bytes = new TextEncoder().encode(text).length;
    const lines = text.split("\n").length;
    setResultMeta(
      reverseMeta,
      t("reverseMetaSummary", { bytes: formatBytes(bytes), lines: String(lines) })
    );
  }

  function clearReverseInput() {
    reverseFile.value = "";
    reverseFileName.hidden = true;
    reverseFileName.textContent = "";
    reverseOut.value = "";
    if (reverseClear) reverseClear.hidden = true;
    sendToConvert.disabled = true;
    copyReverseMd.disabled = true;
    if (downloadReverseMd) downloadReverseMd.disabled = true;
    updateReverseMeta();
    syncReverseResultView();
    syncPrimaryActions();
  }

  function rejectOversized(file, maxBytes) {
    if (!file || file.size <= maxBytes) return false;
    showError({
      problem: t("errorFileTooLarge"),
      cause: file.name + " · " + formatBytes(file.size) + " > " + formatBytes(maxBytes),
      fix: t("errorFileTooLargeFix", { max: formatBytes(maxBytes) }),
    });
    return true;
  }

  function optionalField(el) {
    const v = el.value.trim();
    return v || null;
  }

  function convertFields() {
    return {
      preset: presetEl.value,
      toc: tocEl.checked,
      numbering: numberingEl.checked,
      page_numbers: pageNumbersEl.checked,
      title: optionalField(titleEl),
      author: optionalField(authorEl),
      date: optionalField(dateEl),
      doc_version: optionalField(versionEl),
      toc_title: optionalField(tocTitleEl),
      figure_label: optionalField(figureLabelEl),
      table_label: optionalField(tableLabelEl),
      section_label: optionalField(sectionLabelEl),
      normalize: normalizeEl.checked,
      no_plugins: noPluginsEl.checked,
      strict_mermaid: strictMermaidEl.checked,
      template: templateFileEl.files && templateFileEl.files[0] ? null : templateEl.value || null,
    };
  }

  function appendConvertFields(fd, fields) {
    fd.append("preset", fields.preset);
    fd.append("toc", String(fields.toc));
    fd.append("numbering", String(fields.numbering));
    fd.append("page_numbers", String(fields.page_numbers));
    fd.append("normalize", String(fields.normalize));
    fd.append("no_plugins", String(fields.no_plugins));
    fd.append("strict_mermaid", String(fields.strict_mermaid));
    ["title", "author", "date", "doc_version", "toc_title", "figure_label", "table_label", "section_label"].forEach(
      function (k) {
        if (fields[k]) fd.append(k, fields[k]);
      }
    );
    if (fields.template) fd.append("template", fields.template);
  }

  function convertCli() {
    const fields = convertFields();
    const parts = ["./bin/convert report.md --preset " + fields.preset];
    parts.push(fields.toc ? "--toc" : "--no-toc");
    if (fields.numbering) parts.push("--numbering");
    if (!fields.page_numbers) parts.push("--no-page-numbers");
    if (fields.toc_title) parts.push("--toc-title " + JSON.stringify(fields.toc_title));
    if (fields.title) parts.push("--title " + JSON.stringify(fields.title));
    if (fields.author) parts.push("--author " + JSON.stringify(fields.author));
    if (fields.date) parts.push("--date " + JSON.stringify(fields.date));
    if (fields.doc_version) parts.push("--doc-version " + JSON.stringify(fields.doc_version));
    if (fields.figure_label) parts.push("--figure-label " + JSON.stringify(fields.figure_label));
    if (fields.table_label) parts.push("--table-label " + JSON.stringify(fields.table_label));
    if (fields.section_label) parts.push("--section-label " + JSON.stringify(fields.section_label));
    if (!fields.normalize) parts.push("--no-normalize");
    if (fields.no_plugins) parts.push("--no-plugins");
    if (fields.strict_mermaid) parts.push("--strict-mermaid");
    if (templateFileEl.files && templateFileEl.files[0]) {
      parts.push("--template " + templateFileEl.files[0].name);
    } else if (fields.template) {
      parts.push("--template templates/" + fields.template + "/template.docx");
    }
    return parts.join(" ");
  }

  function updateCharCount() {
    const bytes = new TextEncoder().encode(markdownEl.value).length;
    const limit = 400 * 1024;
    charCountEl.textContent = formatBytes(bytes);
    charCountEl.classList.toggle("pane__meta--warn", bytes > limit * 0.85);
    charCountEl.classList.toggle("pane__meta--over", bytes > limit);
    if (bytes > limit) {
      charCountEl.title = t("errorFileTooLargeFix", { max: formatBytes(limit) });
    } else if (bytes > limit * 0.85) {
      charCountEl.title = formatBytes(bytes) + " / " + formatBytes(limit);
    } else {
      charCountEl.removeAttribute("title");
    }
    syncPrimaryActions();
  }

  function focusPanelFirstField(panel) {
    if (!panel) return;
    const focusable = panel.querySelector(
      "input:not([type='hidden']):not([type='file']), select, textarea, button"
    );
    if (focusable) {
      try {
        focusable.focus({ preventScroll: true });
      } catch (_) {
        focusable.focus();
      }
    }
  }

  function closeOpenOptions() {
    if (optionsOpen) {
      optionsOpen = false;
      optionsPanel.classList.add("hidden");
      toggleOptions.setAttribute("aria-expanded", "false");
      toggleOptions.textContent = t("btnOptions");
      syncPanelInert();
      toggleOptions.focus();
      return true;
    }
    if (batchOptionsOpen) {
      batchOptionsOpen = false;
      batchOptionsPanel.classList.add("hidden");
      toggleBatchOptions.setAttribute("aria-expanded", "false");
      toggleBatchOptions.textContent = t("btnOptions");
      syncPanelInert();
      toggleBatchOptions.focus();
      return true;
    }
    if (diffOptionsOpen) {
      diffOptionsOpen = false;
      diffOptionsPanel.classList.add("hidden");
      toggleDiffOptions.setAttribute("aria-expanded", "false");
      toggleDiffOptions.textContent = t("btnOptions");
      syncPanelInert();
      toggleDiffOptions.focus();
      return true;
    }
    return false;
  }

  function showPreviewEmpty() {
    previewEl.classList.remove("preview--loading", "preview--error", "preview--heavy");
    previewEl.classList.add("preview--empty");
    setPreviewTruncated(false);
    previewEl.innerHTML =
      '<div class="empty-state" role="status">' +
      '<p class="empty-state__title"></p>' +
      '<p class="empty-state__hint"></p>' +
      '<div class="empty-state__actions">' +
      '<button type="button" class="btn btn--ghost btn--small" data-empty-action="example"></button>' +
      '<button type="button" class="btn btn--primary btn--small" data-empty-action="paste"></button>' +
      "</div></div>";
    previewEl.querySelector(".empty-state__title").textContent = t("previewEmptyTitle");
    previewEl.querySelector(".empty-state__hint").textContent = t("previewEmptyHint");
    const exampleBtn = previewEl.querySelector('[data-empty-action="example"]');
    const pasteBtn = previewEl.querySelector('[data-empty-action="paste"]');
    exampleBtn.textContent = t("emptyActionExample");
    pasteBtn.textContent = t("emptyActionPaste");
    exampleBtn.addEventListener("click", function () {
      exampleEl.value = "technical-report";
      loadExample("technical-report");
    });
    pasteBtn.addEventListener("click", function () {
      setConvertInputMode("paste");
    });
  }

  function showPreviewError(rawText, detail) {
    previewEl.classList.remove("preview--loading", "preview--empty");
    previewEl.classList.add("preview--error");
    previewEl.innerHTML =
      '<div class="empty-state empty-state--error" role="alert">' +
      '<p class="empty-state__title"></p>' +
      '<p class="empty-state__hint"></p>' +
      '<pre class="empty-state__raw"></pre>' +
      "</div>";
    previewEl.querySelector(".empty-state__title").textContent =
      (detail && detail.problem) || t("previewErrorTitle");
    previewEl.querySelector(".empty-state__hint").textContent =
      (detail && detail.fix) || t("previewErrorHint");
    previewEl.querySelector(".empty-state__raw").textContent =
      (detail && detail.cause) || rawText || "";
  }

  function setPanelEmpty(el, emptyKey, titleKey) {
    el.classList.add("panel-out--empty");
    el.classList.remove("panel-out--loading");
    el.dataset.empty = "1";
    const isDiff = el === diffOut;
    const isBatch = el === batchOut;
    const isReverse = el === reverseEmpty;
    el.innerHTML =
      '<div class="empty-state" role="status">' +
      '<p class="empty-state__title"></p>' +
      '<p class="empty-state__hint"></p>' +
      (isDiff || isBatch || isReverse
        ? '<div class="empty-state__actions"><button type="button" class="btn btn--primary btn--small" data-panel-action></button></div>'
        : "") +
      "</div>";
    el.querySelector(".empty-state__title").textContent = t(titleKey);
    el.querySelector(".empty-state__hint").textContent = t(emptyKey);
    const action = el.querySelector("[data-panel-action]");
    if (action && isDiff) {
      action.textContent = t("btnLoadSample");
      action.addEventListener("click", function () {
        loadDiffSample.click();
      });
    }
    if (action && isBatch) {
      action.textContent = t("dropChooseFiles");
      action.addEventListener("click", function () {
        batchFilesInput.click();
      });
    }
    if (action && isReverse) {
      action.textContent = t("dropChooseDocx");
      action.addEventListener("click", function () {
        reverseFile.click();
      });
    }
    const meta = isDiff
      ? document.getElementById("diff-meta")
      : isBatch
        ? document.getElementById("batch-meta")
        : isReverse
          ? reverseMeta
          : null;
    if (meta) {
      meta.hidden = true;
      meta.textContent = "";
    }
  }

  function syncReverseResultView() {
    if (!reverseEmpty || !reverseOut) return;
    const hasText = !!(reverseOut.value && reverseOut.value.trim());
    if (hasText) {
      reverseEmpty.hidden = true;
      reverseEmpty.classList.add("hidden");
      reverseEmpty.dataset.empty = "0";
      reverseOut.hidden = false;
      reverseOut.classList.remove("hidden");
    } else {
      reverseOut.hidden = true;
      reverseOut.classList.add("hidden");
      reverseEmpty.hidden = false;
      reverseEmpty.classList.remove("hidden");
      setPanelEmpty(reverseEmpty, "reverseOutEmpty", "reverseOutEmptyTitle");
    }
  }

  function setPanelText(el, text) {
    clearPanelEmpty(el);
    el.textContent = text;
  }

  function setResultMeta(el, text) {
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = text;
  }

  function summarizeDiff(text) {
    const lines = String(text || "").split("\n");
    let added = 0;
    let removed = 0;
    lines.forEach(function (line) {
      if (line.startsWith("+") && !line.startsWith("+++")) added += 1;
      else if (line.startsWith("-") && !line.startsWith("---")) removed += 1;
    });
    if (!added && !removed) return t("diffMetaNone");
    return t("diffMetaSummary", { added: String(added), removed: String(removed) });
  }

  function clearPanelEmpty(el) {
    el.classList.remove("panel-out--empty");
    el.dataset.empty = "0";
  }

  function setPanelLoading(el, loading) {
    if (!el) return;
    el.classList.toggle("panel-out--loading", !!loading);
    el.setAttribute("aria-busy", loading ? "true" : "false");
  }

  function wireRovingGroup(root, itemSelector) {
    if (!root) return;
    root.addEventListener("keydown", function (e) {
      const items = Array.prototype.slice.call(root.querySelectorAll(itemSelector));
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement);
      if (idx < 0) return;
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (idx + 1) % items.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (idx - 1 + items.length) % items.length;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = items.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      items[next].focus();
      items[next].click();
    });
  }

  function syncRovingTabindex(root, itemSelector, activeAttr, activeValue) {
    if (!root) return;
    root.querySelectorAll(itemSelector).forEach(function (btn) {
      const on = btn.getAttribute(activeAttr) === activeValue;
      btn.tabIndex = on ? 0 : -1;
    });
  }

  function schedulePreview() {
    updateCharCount();
    clearTimeout(debounceTimer);
    const bytes = new TextEncoder().encode(markdownEl.value).length;
    let delay = 280;
    if (bytes > 64 * 1024) delay = 700;
    else if (bytes > 8 * 1024) delay = 450;
    debounceTimer = setTimeout(fetchPreview, delay);
  }

  function setPreviewTruncated(on) {
    const badge = document.getElementById("preview-truncated");
    if (!badge) return;
    badge.hidden = !on;
    badge.classList.toggle("hidden", !on);
    if (on) badge.textContent = t("previewTruncated");
  }

  async function fetchPreview() {
    const text = markdownEl.value;
    if (!text.trim()) {
      lastPreviewKey = "";
      setPreviewTruncated(false);
      showPreviewEmpty();
      return;
    }
    const maxChars = 400 * 1024;
    // Keep preview requests under API limits; mirror server soft-truncation UX.
    let payload = text;
    let forceTruncated = false;
    if (payload.length > maxChars) {
      const soft = 80_000;
      const cut = payload.lastIndexOf("\n", soft);
      payload = payload.slice(0, cut > soft / 2 ? cut : soft);
      forceTruncated = true;
    }
    const key = (numberingEl.checked ? "1" : "0") + "\0" + text.length + "\0" + payload;
    if (key === lastPreviewKey && !previewEl.classList.contains("preview--error")) {
      return;
    }
    const seq = ++previewSeq;
    if (previewAbort) previewAbort.abort();
    previewAbort = typeof AbortController !== "undefined" ? new AbortController() : null;
    const hadContent = !previewEl.classList.contains("preview--empty") &&
      !previewEl.classList.contains("preview--error") &&
      previewEl.innerHTML.trim();
    previewEl.classList.remove("preview--empty", "preview--error");
    previewEl.classList.add("preview--loading");
    if (!hadContent) {
      previewEl.innerHTML = previewSkeletonHtml();
    }
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: payload, numbering: numberingEl.checked }),
        signal: previewAbort ? previewAbort.signal : undefined,
      });
      if (seq !== previewSeq) return;
      if (!res.ok) {
        previewEl.classList.remove("preview--loading");
        setPreviewTruncated(false);
        let json = {};
        try { json = await res.json(); } catch (_) {}
        showPreviewError("", parseError(res, json));
        return;
      }
      const data = await res.json();
      if (seq !== previewSeq) return;
      previewEl.classList.remove("preview--loading");
      if (!data.html) {
        setPreviewTruncated(false);
        showPreviewEmpty();
        return;
      }
      previewEl.innerHTML = data.html;
      previewEl.classList.toggle("preview--heavy", data.html.length > 40_000);
      setPreviewTruncated(!!data.truncated || forceTruncated);
      lastPreviewKey = key;
      if (data.css && !document.getElementById("engine-preview-css")) {
        const style = document.createElement("style");
        style.id = "engine-preview-css";
        style.textContent = data.css;
        document.head.appendChild(style);
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      if (seq !== previewSeq) return;
      previewEl.classList.remove("preview--loading");
      setPreviewTruncated(false);
      showPreviewError("", networkErrorDetail(err));
    }
  }

  async function loadPresets() {
    const res = await fetch("/api/presets");
    const data = await res.json();
    presetsCache = data.presets;
    rebuildPresetOptions();
    presetEl.value = "technical";
    batchPresetEl.value = "technical";
    applyPresetUi("technical");
    applyBatchPresetUi("technical");
  }

  async function loadTemplates() {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      (data.templates || []).forEach(function (tpl) {
        [templateEl, batchTemplate].forEach(function (sel) {
          const opt = document.createElement("option");
          opt.value = tpl.id;
          opt.textContent = tpl.name;
          sel.appendChild(opt);
        });
      });
    } catch (_) {
      /* optional */
    }
  }

  async function loadExample(name) {
    if (!name) return;
    showError(null);
    try {
      const res = await fetch("/examples/" + name + ".md");
      if (!res.ok) throw new Error("failed to load example");
      markdownEl.value = await res.text();
      setConvertInputMode("paste");
      schedulePreview();
      const label = exampleEl.options[exampleEl.selectedIndex].textContent;
      showToast(t("toastLoaded", { name: label }));
    } catch (e) {
      exampleEl.value = "";
      showError({
        problem: t("errorExampleLoad"),
        cause: String(e),
        fix: t("errorExampleFix"),
      });
    }
  }

  async function ingestMdFile(file) {
    if (!file) return;
    const name = (file.name || "").toLowerCase();
    if (!name.endsWith(".md")) {
      showError({
        problem: t("errorNoMd"),
        cause: "expected .md",
        fix: t("errorNoMdFix"),
      });
      return;
    }
    if (rejectOversized(file, 400 * 1024)) return;
    markdownEl.value = await file.text();
    setConvertInputMode("paste");
    schedulePreview();
    showToast(t("toastMdLoaded", { name: file.name }));
  }

  async function generateDocx() {
    showError(null);
    if (!markdownEl.value.trim()) {
      showError({ problem: t("errorNoMd"), cause: "empty", fix: t("errorNoMdFix") });
      return;
    }
    setBtnLoading(generateBtn, true, "btnExport", "btnExportLoading");
    try {
      const fields = convertFields();
      let res;
      if (templateFileEl.files && templateFileEl.files[0]) {
        const fd = new FormData();
        fd.append("markdown", markdownEl.value);
        appendConvertFields(fd, fields);
        fd.append("template_file", templateFileEl.files[0], templateFileEl.files[0].name);
        res = await fetch("/api/convert", { method: "POST", body: fd });
      } else {
        const payload = { markdown: markdownEl.value, ...fields };
        Object.keys(payload).forEach(function (k) {
          if (payload[k] === null || payload[k] === undefined || payload[k] === "") delete payload[k];
        });
        res = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        let json = {};
        try { json = await res.json(); } catch (_) {}
        showError(parseError(res, json));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.docx";
      a.click();
      URL.revokeObjectURL(url);
      showToast(t("toastDownloaded"));
    } catch (e) {
      showError(networkErrorDetail(e));
    } finally {
      setBtnLoading(generateBtn, false, "btnExport", "btnExportLoading");
    }
  }

  async function runValidate() {
    showError(null);
    setBtnLoading(validateBtn, true, "btnValidate", "btnValidateLoading");
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: markdownEl.value,
          strict: validateStrictEl.checked,
          format: "json",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showError(parseError(res, json));
        return;
      }
      const issues = json.issues || [];
      validateList.innerHTML = "";
      validatePanel.classList.remove("hidden");
      syncPanelInert();
      if (!issues.length) {
        validateMeta.textContent = t("validateClean");
        const li = document.createElement("li");
        li.className = "validate-list__ok";
        li.textContent = t("validateClean");
        validateList.appendChild(li);
      } else {
        validateMeta.textContent = t("validateCount", { n: String(issues.length) });
        issues.forEach(function (issue) {
          const li = document.createElement("li");
          li.className = "validate-list__item validate-list__item--" + issue.severity;
          const line = issue.line != null ? "L" + issue.line + " · " : "";
          li.textContent = line + issue.code + ": " + issue.message;
          if (issue.line != null) {
            li.tabIndex = 0;
            li.setAttribute("role", "button");
            li.setAttribute("aria-label", t("goToLine", { line: String(issue.line) }));
            function go() {
              setConvertInputMode("paste");
              jumpToLine(issue.line);
            }
            li.addEventListener("click", go);
            li.addEventListener("keydown", function (e) {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                go();
              }
            });
          }
          validateList.appendChild(li);
        });
      }
      showToast(t("toastValidated"));
    } catch (e) {
      showError(networkErrorDetail(e));
    } finally {
      setBtnLoading(validateBtn, false, "btnValidate", "btnValidateLoading");
    }
  }

  function jumpToLine(line) {
    const lines = markdownEl.value.split("\n");
    let pos = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      pos += lines[i].length + 1;
    }
    markdownEl.focus();
    markdownEl.setSelectionRange(pos, pos);
    const ratio = (line - 1) / Math.max(lines.length, 1);
    markdownEl.scrollTop = ratio * markdownEl.scrollHeight;
  }

  function insertSnippet(key) {
    setConvertInputMode("paste");
    const block = SNIPPETS[key];
    if (!block) return;
    const start = markdownEl.selectionStart;
    const end = markdownEl.selectionEnd;
    const value = markdownEl.value;
    markdownEl.value = value.slice(0, start) + block + value.slice(end);
    markdownEl.focus();
    const cursor = start + block.length;
    markdownEl.setSelectionRange(cursor, cursor);
    schedulePreview();
    showToast(t("toastSnippet", { name: document.querySelector('[data-snippet="' + key + '"]').textContent }));
  }

  function wireDropzone(zone, input, onFiles) {
    if (!zone || !input) return;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    zone.setAttribute("role", "region");
    const title = zone.querySelector(".dropzone__title");
    if (title && title.textContent) {
      zone.setAttribute("aria-label", title.textContent.trim());
    }
    zone.addEventListener("click", function (e) {
      if (e.target === input) return;
      if (e.target.closest("button, a, label")) return;
      input.click();
    });
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      zone.classList.add("dropzone--drag");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("dropzone--drag");
    });
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      zone.classList.remove("dropzone--drag");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        onFiles(e.dataTransfer.files);
      }
    });
    input.addEventListener("change", function () {
      if (input.files && input.files.length) onFiles(input.files);
    });
  }

  async function doReverse() {
    showError(null);
    const file = reverseFile.files && reverseFile.files[0];
    if (!file) {
      showError({ problem: t("errorNoFile"), cause: "no upload", fix: t("errorNoFileFix") });
      return;
    }
    setBtnLoading(runReverse, true, "btnReverse", "btnReverseLoading");
    if (reverseEmpty) {
      reverseEmpty.hidden = false;
      reverseEmpty.classList.remove("hidden");
      reverseOut.hidden = true;
      reverseOut.classList.add("hidden");
      setPanelLoading(reverseEmpty, true);
    } else {
      setPanelLoading(reverseOut, true);
    }
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await fetch("/api/reverse", { method: "POST", body: fd });
      if (!res.ok) {
        let json = {};
        try { json = await res.json(); } catch (_) {}
        showError(parseError(res, json));
        syncReverseResultView();
        return;
      }
      reverseOut.value = await res.text();
      sendToConvert.disabled = !reverseOut.value.trim();
      copyReverseMd.disabled = !reverseOut.value.trim();
      if (downloadReverseMd) downloadReverseMd.disabled = !reverseOut.value.trim();
      updateReverseMeta();
      syncReverseResultView();
      showToast(t("toastReversed"));
    } catch (e) {
      showError(networkErrorDetail(e));
      syncReverseResultView();
    } finally {
      if (reverseEmpty) setPanelLoading(reverseEmpty, false);
      setPanelLoading(reverseOut, false);
      setBtnLoading(runReverse, false, "btnReverse", "btnReverseLoading");
    }
  }

  async function doDiff() {
    showError(null);
    setResultMeta(document.getElementById("diff-meta"), "");
    const a = diffA.value;
    const b = diffB.value;
    const fileA = diffFileA.files && diffFileA.files[0];
    const fileB = diffFileB.files && diffFileB.files[0];
    setBtnLoading(runDiff, true, "btnDiff", "btnDiffLoading");
    setPanelLoading(diffOut, true);
    try {
      let res;
      if (diffInputMode === "upload") {
        if (!fileA || !fileB) {
          showError({ problem: t("errorDiffEmpty"), cause: "missing uploads", fix: t("errorDiffEmptyFix") });
          return;
        }
        const fd = new FormData();
        fd.append("a", fileA, fileA.name);
        fd.append("b", fileB, fileB.name);
        fd.append("format", diffFormat.value);
        res = await fetch("/api/diff/files", { method: "POST", body: fd });
      } else {
        if (!a.trim() && !b.trim()) {
          showError({ problem: t("errorDiffEmpty"), cause: "empty", fix: t("errorDiffEmptyFix") });
          return;
        }
        res = await fetch("/api/diff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: a, b: b, format: diffFormat.value }),
        });
      }
      if (!res.ok) {
        let json = {};
        try { json = await res.json(); } catch (_) {}
        showError(parseError(res, json));
        return;
      }
      diffOut.textContent = await res.text();
      clearPanelEmpty(diffOut);
      setResultMeta(document.getElementById("diff-meta"), summarizeDiff(diffOut.textContent));
      showToast(t("toastDiffed"));
    } catch (e) {
      showError(networkErrorDetail(e));
    } finally {
      setPanelLoading(diffOut, false);
      setBtnLoading(runDiff, false, "btnDiff", "btnDiffLoading");
    }
  }

  function renderBatchList() {
    batchFileList.innerHTML = "";
    if (!batchItems.length) {
      batchFileList.classList.add("hidden");
      batchDropzone.classList.remove("hidden");
      batchClear.hidden = true;
      syncPrimaryActions();
      return;
    }
    batchFileList.classList.remove("hidden");
    batchDropzone.classList.add("hidden");
    batchClear.hidden = false;
    batchItems.forEach(function (item, idx) {
      const li = document.createElement("li");
      li.className = "file-list__item";
      const name = document.createElement("span");
      name.textContent = item.name + " (" + formatBytes(item.file.size) + ")";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn--ghost btn--small";
      remove.textContent = "×";
      remove.setAttribute("aria-label", t("btnRemoveFile") + ": " + item.name);
      remove.title = t("btnRemoveFile");
      remove.addEventListener("click", function () {
        batchItems.splice(idx, 1);
        renderBatchList();
      });
      li.appendChild(name);
      li.appendChild(remove);
      batchFileList.appendChild(li);
    });
    syncPrimaryActions();
  }

  function addBatchFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const zips = files.filter(function (f) {
      return (f.name || "").toLowerCase().endsWith(".zip");
    });
    const mds = files.filter(function (f) {
      return (f.name || "").toLowerCase().endsWith(".md");
    });
    if (zips.length && mds.length) {
      showError({
        problem: t("errorBatchMixed"),
        cause: "zip + markdown",
        fix: t("errorBatchMixedFix"),
      });
      return;
    }
    if (zips.length > 1) {
      showError({
        problem: t("errorBatchMultiZip"),
        cause: "zip count > 1",
        fix: t("errorBatchMultiZipFix"),
      });
      return;
    }
    if (zips.length === 1) {
      if (rejectOversized(zips[0], 10 * 1024 * 1024)) return;
      batchItems = [{ file: zips[0], name: zips[0].name, kind: "zip" }];
    } else {
      batchItems = batchItems.filter(function (i) { return i.kind !== "zip"; });
      mds.forEach(function (f) {
        if (!batchItems.some(function (i) { return i.name === f.name && i.file.size === f.size; })) {
          batchItems.push({ file: f, name: f.name, kind: "md" });
        }
      });
      const total = batchItems.reduce(function (sum, item) { return sum + item.file.size; }, 0);
      if (total > 10 * 1024 * 1024) {
        showError({
          problem: t("errorFileTooLarge"),
          cause: formatBytes(total) + " > " + formatBytes(10 * 1024 * 1024),
          fix: t("errorFileTooLargeFix", { max: formatBytes(10 * 1024 * 1024) }),
        });
        return;
      }
    }
    renderBatchList();
    showError(null);
  }

  function batchCli() {
    const parts = ["md-to-docx ./docs --preset " + batchPresetEl.value];
    parts.push(batchToc.checked ? "--toc" : "--no-toc");
    if (batchNumbering.checked) parts.push("--numbering");
    if (!batchPageNumbers.checked) parts.push("--no-page-numbers");
    if (!batchNormalize.checked) parts.push("--no-normalize");
    if (batchSkipExisting.checked) parts.push("--skip-existing");
    batchExclude.value.split("\n").forEach(function (line) {
      const p = line.trim();
      if (p && !p.startsWith("#")) parts.push("--exclude " + JSON.stringify(p));
    });
    if (batchTemplate.value) {
      parts.push("--template templates/" + batchTemplate.value + "/template.docx");
    }
    return parts.join(" ");
  }

  async function runBatchConvert(dryRun) {
    showError(null);
    setResultMeta(document.getElementById("batch-meta"), "");
    if (!batchItems.length) {
      showError({ problem: t("errorBatchEmpty"), cause: "empty", fix: t("errorBatchEmptyFix") });
      return;
    }
    const btn = dryRun ? batchDryRun : runBatch;
    const idle = dryRun ? "btnDryRun" : "btnBatch";
    const loading = dryRun ? "btnDryRunLoading" : "btnBatchLoading";
    setBtnLoading(btn, true, idle, loading);
    setPanelLoading(batchOut, true);
    try {
      const fd = new FormData();
      const first = batchItems[0];
      if (first.kind === "zip") {
        fd.append("archive", first.file, first.name);
      } else {
        batchItems.forEach(function (item) {
          fd.append("files", item.file, item.name);
        });
      }
      fd.append("preset", batchPresetEl.value);
      fd.append("toc", String(batchToc.checked));
      fd.append("numbering", String(batchNumbering.checked));
      fd.append("page_numbers", String(batchPageNumbers.checked));
      fd.append("normalize", String(batchNormalize.checked));
      fd.append("dry_run", String(!!dryRun));
      fd.append("skip_existing", String(batchSkipExisting.checked));
      if (batchExclude.value.trim()) fd.append("exclude", batchExclude.value);
      if (batchTemplateFile.files && batchTemplateFile.files[0]) {
        fd.append("template_file", batchTemplateFile.files[0], batchTemplateFile.files[0].name);
      } else if (batchTemplate.value) {
        fd.append("template", batchTemplate.value);
      }
      const res = await fetch("/api/convert/batch", { method: "POST", body: fd });
      if (!res.ok) {
        let json = {};
        try { json = await res.json(); } catch (_) {}
        showError(parseError(res, json));
        return;
      }
      const ctype = res.headers.get("content-type") || "";
      if (ctype.indexOf("application/json") >= 0 || dryRun) {
        const data = await res.json();
        const lines = [];
        (data.planned || []).forEach(function (p) { lines.push("→ " + p); });
        (data.skipped || []).forEach(function (p) { lines.push("skip " + p); });
        const planned = (data.planned || []).length;
        const skipped = (data.skipped || []).length;
        if (!lines.length) {
          setPanelEmpty(batchOut, "batchEmpty", "batchEmptyTitle");
          setResultMeta(document.getElementById("batch-meta"), "");
        } else {
          setPanelText(batchOut, lines.join("\n"));
          setResultMeta(
            document.getElementById("batch-meta"),
            t("batchMetaPlan", { planned: String(planned), skipped: String(skipped) })
          );
        }
        showToast(t("toastBatchPlanned", { n: String(planned) }));
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "documents.zip";
        a.click();
        URL.revokeObjectURL(url);
        const n = res.headers.get("X-Batch-Count") || String(batchItems.length);
        setPanelText(batchOut, t("batchZipReady", { n: n }));
        setResultMeta(document.getElementById("batch-meta"), t("batchMetaDone", { n: n }));
        showToast(t("toastBatchDownloaded"));
      }
    } catch (e) {
      showError(networkErrorDetail(e));
    } finally {
      setPanelLoading(batchOut, false);
      setBtnLoading(btn, false, idle, loading);
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(function () {
      showToast(t("toastCopied"));
    }).catch(function () {
      showError({ problem: t("errorCopy"), cause: "Clipboard access denied", fix: t("errorCopyFix") });
    });
  }

  /* ── events ── */
  markdownEl.addEventListener("input", schedulePreview);
  diffA.addEventListener("input", syncPrimaryActions);
  diffB.addEventListener("input", syncPrimaryActions);
  numberingEl.addEventListener("change", function () {
    applyPresetUi(presetEl.value, false);
    schedulePreview();
  });
  tocEl.addEventListener("change", function () {
    applyPresetUi(presetEl.value, false);
  });

  errorDismiss.addEventListener("click", function () { showError(null); });
  if (errorRetry) {
    errorRetry.addEventListener("click", function () {
      showError(null);
      if (currentMode === "convert" && !generateBtn.disabled) generateBtn.click();
      else if (currentMode === "batch" && !runBatch.disabled) runBatch.click();
      else if (currentMode === "reverse" && !runReverse.disabled) runReverse.click();
      else if (currentMode === "diff" && !runDiff.disabled) runDiff.click();
      else if (currentMode === "convert") schedulePreview();
    });
  }

  presetEl.addEventListener("change", function () {
    applyPresetUi(presetEl.value);
    schedulePreview();
  });
  batchPresetEl.addEventListener("change", function () {
    applyBatchPresetUi(batchPresetEl.value);
  });

  templateFileEl.addEventListener("change", function () {
    if (templateFileEl.files && templateFileEl.files[0]) templateEl.value = "";
  });
  templateEl.addEventListener("change", function () {
    if (templateEl.value) templateFileEl.value = "";
  });
  batchTemplateFile.addEventListener("change", function () {
    if (batchTemplateFile.files && batchTemplateFile.files[0]) batchTemplate.value = "";
  });
  batchTemplate.addEventListener("change", function () {
    if (batchTemplate.value) batchTemplateFile.value = "";
  });

  langEnBtn.addEventListener("click", function () { setLang("en"); });
  langZhBtn.addEventListener("click", function () { setLang("zh"); });

  exampleEl.addEventListener("change", function () { loadExample(exampleEl.value); });
  generateBtn.addEventListener("click", generateDocx);
  validateBtn.addEventListener("click", runValidate);

  toggleOptions.addEventListener("click", function () {
    optionsOpen = !optionsOpen;
    optionsPanel.classList.toggle("hidden", !optionsOpen);
    toggleOptions.setAttribute("aria-expanded", optionsOpen ? "true" : "false");
    toggleOptions.textContent = optionsOpen ? t("btnOptionsHide") : t("btnOptions");
    syncPanelInert();
    if (optionsOpen) focusPanelFirstField(optionsPanel);
  });
  toggleBatchOptions.addEventListener("click", function () {
    batchOptionsOpen = !batchOptionsOpen;
    batchOptionsPanel.classList.toggle("hidden", !batchOptionsOpen);
    toggleBatchOptions.setAttribute("aria-expanded", batchOptionsOpen ? "true" : "false");
    toggleBatchOptions.textContent = batchOptionsOpen ? t("btnOptionsHide") : t("btnOptions");
    syncPanelInert();
    if (batchOptionsOpen) focusPanelFirstField(batchOptionsPanel);
  });
  toggleDiffOptions.addEventListener("click", function () {
    diffOptionsOpen = !diffOptionsOpen;
    diffOptionsPanel.classList.toggle("hidden", !diffOptionsOpen);
    toggleDiffOptions.setAttribute("aria-expanded", diffOptionsOpen ? "true" : "false");
    toggleDiffOptions.textContent = diffOptionsOpen ? t("btnOptionsHide") : t("btnOptions");
    syncPanelInert();
    if (diffOptionsOpen) focusPanelFirstField(diffOptionsPanel);
  });

  document.querySelectorAll("#convert-input-mode .segmented__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setConvertInputMode(btn.getAttribute("data-input-mode"));
    });
  });
  document.querySelectorAll("#diff-input-mode .segmented__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setDiffInputMode(btn.getAttribute("data-diff-mode"));
    });
  });

  document.querySelectorAll("[data-snippet]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      insertSnippet(btn.getAttribute("data-snippet"));
    });
  });

  document.querySelectorAll(".mode-nav__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.getAttribute("data-mode"));
    });
  });

  wireDropzone(convertDropzone, convertFile, function (files) {
    ingestMdFile(files[0]);
  });
  const convertPickFile = document.getElementById("convert-pick-file");
  if (convertPickFile) {
    convertPickFile.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      convertFile.click();
    });
  }
  wireDropzone(reverseDropzone, reverseFile, function (files) {
    if (rejectOversized(files[0], 2 * 1024 * 1024)) return;
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    reverseFile.files = dt.files;
    reverseFileName.hidden = false;
    reverseFileName.textContent = files[0].name;
    if (reverseClear) reverseClear.hidden = false;
    syncPrimaryActions();
    doReverse();
  });
  wireDropzone(batchDropzone, batchFilesInput, addBatchFiles);
  wireDropzone(diffDropA, diffFileA, function (files) {
    if (rejectOversized(files[0], 2 * 1024 * 1024)) return;
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    diffFileA.files = dt.files;
    diffFileAName.hidden = false;
    diffFileAName.textContent = files[0].name;
    if (files[0].name.toLowerCase().endsWith(".md")) {
      files[0].text().then(function (text) {
        diffA.value = text;
        syncPrimaryActions();
      });
    }
    syncPrimaryActions();
  });
  wireDropzone(diffDropB, diffFileB, function (files) {
    if (rejectOversized(files[0], 2 * 1024 * 1024)) return;
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    diffFileB.files = dt.files;
    diffFileBName.hidden = false;
    diffFileBName.textContent = files[0].name;
    if (files[0].name.toLowerCase().endsWith(".md")) {
      files[0].text().then(function (text) {
        diffB.value = text;
        syncPrimaryActions();
      });
    }
    syncPrimaryActions();
  });

  batchClear.addEventListener("click", function () {
    batchItems = [];
    batchFilesInput.value = "";
    renderBatchList();
    setPanelEmpty(batchOut, "batchEmpty", "batchEmptyTitle");
  });
  const batchPickFiles = document.getElementById("batch-pick-files");
  if (batchPickFiles) {
    batchPickFiles.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      batchFilesInput.click();
    });
  }
  runBatch.addEventListener("click", function () { runBatchConvert(false); });
  batchDryRun.addEventListener("click", function () { runBatchConvert(true); });
  copyCliBatch.addEventListener("click", function () { copyText(batchCli()); });

  copyCliBtn.addEventListener("click", function () { copyText(convertCli()); });
  copyCliReverse.addEventListener("click", function () {
    copyText("md-to-docx reverse input.docx -o report.md");
  });
  copyCliDiff.addEventListener("click", function () {
    copyText("md-to-docx diff a.md b.md --format " + diffFormat.value);
  });

  runReverse.addEventListener("click", doReverse);
  copyReverseMd.addEventListener("click", function () {
    if (!reverseOut.value) return;
    navigator.clipboard.writeText(reverseOut.value).then(function () {
      showToast(t("toastCopiedMd"));
    });
  });
  if (downloadReverseMd) {
    downloadReverseMd.addEventListener("click", function () {
      if (!reverseOut.value.trim()) return;
      downloadTextFile("document.md", reverseOut.value, "text/markdown;charset=utf-8");
      showToast(t("toastMdDownloaded"));
    });
  }
  if (reverseClear) {
    reverseClear.addEventListener("click", clearReverseInput);
  }
  const reversePickFile = document.getElementById("reverse-pick-file");
  if (reversePickFile) {
    reversePickFile.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      reverseFile.click();
    });
  }
  ["diff-pick-a", "diff-pick-b"].forEach(function (id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const input = id === "diff-pick-a" ? diffFileA : diffFileB;
      input.click();
    });
  });
  sendToConvert.addEventListener("click", function () {
    if (!reverseOut.value.trim()) return;
    markdownEl.value = reverseOut.value;
    setMode("convert");
    setConvertInputMode("paste");
    schedulePreview();
    showToast(t("toastSentConvert"));
  });

  runDiff.addEventListener("click", doDiff);
  loadDiffSample.addEventListener("click", function () {
    setDiffInputMode("paste");
    diffA.value = DIFF_SAMPLE_A;
    diffB.value = DIFF_SAMPLE_B;
    diffFileA.value = "";
    diffFileB.value = "";
    diffFileAName.hidden = true;
    diffFileBName.hidden = true;
    showToast(t("toastSample"));
    doDiff();
  });

  document.addEventListener("keydown", function (e) {
    if (shortcutsOpen && e.key === "Tab") {
      const dialog = document.getElementById("shortcuts-dialog");
      const panel = dialog && dialog.querySelector(".shortcuts-dialog__panel");
      const focusables = panel
        ? Array.prototype.slice.call(
            panel.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];
      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (e.key === "Escape") {
      if (shortcutsOpen) {
        closeShortcuts();
        return;
      }
      if (!errorEl.classList.contains("hidden")) {
        showError(null);
        return;
      }
      if (closeOpenOptions()) return;
    }
    const typingTarget = e.target && (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.tagName === "SELECT" ||
      e.target.isContentEditable
    );
    if (!typingTarget && (e.key === "?" || ((e.metaKey || e.ctrlKey) && e.key === "/"))) {
      e.preventDefault();
      if (shortcutsOpen) closeShortcuts();
      else openShortcuts();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (currentMode === "convert" && !generateBtn.disabled) generateDocx();
      if (currentMode === "batch" && !runBatch.disabled) runBatchConvert(false);
      if (currentMode === "reverse" && !runReverse.disabled) doReverse();
      if (currentMode === "diff" && !runDiff.disabled) doDiff();
    }
  });

  const openShortcutsBtn = document.getElementById("open-shortcuts");
  if (openShortcutsBtn) {
    openShortcutsBtn.addEventListener("click", openShortcuts);
  }
  const shortcutsCloseBtn = document.getElementById("shortcuts-close");
  if (shortcutsCloseBtn) {
    shortcutsCloseBtn.addEventListener("click", closeShortcuts);
  }
  document.querySelectorAll("[data-shortcuts-dismiss]").forEach(function (el) {
    el.addEventListener("click", closeShortcuts);
  });

  wireRovingGroup(document.querySelector(".mode-nav"), ".mode-nav__btn");
  wireRovingGroup(document.getElementById("convert-input-mode"), ".segmented__btn");
  wireRovingGroup(document.getElementById("diff-input-mode"), ".segmented__btn");

  const modeNav = document.getElementById("mode-nav");
  function syncChromeScroll() {
    const scrolled = window.scrollY > 6;
    if (modeNav) modeNav.classList.toggle("mode-nav--scrolled", scrolled);
    document.querySelectorAll(".toolbar").forEach(function (bar) {
      if (!bar.classList.contains("hidden") && !bar.hidden) {
        bar.classList.toggle("toolbar--scrolled", scrolled);
      } else {
        bar.classList.remove("toolbar--scrolled");
      }
    });
  }
  window.addEventListener("scroll", syncChromeScroll, { passive: true });
  syncChromeScroll();
  window.addEventListener("online", syncOfflineBanner);
  window.addEventListener("offline", syncOfflineBanner);
  syncOfflineBanner();

  Promise.all([loadPresets(), loadTemplates()]).then(function () {
    applyI18n();
    markdownEl.value = currentLang === "zh"
      ? "# 技术报告\n\n在此粘贴 AI 生成的 Markdown。\n"
      : "# Technical Report\n\nPaste AI-generated Markdown here.\n";
    setMode("convert");
    setConvertInputMode("upload");
    updateCharCount();
    showPreviewEmpty();
    syncReverseResultView();
    syncPrimaryActions();
    document.body.classList.remove("app--booting");
    document.body.classList.add("app--ready");
  }).catch(function () {
    document.body.classList.remove("app--booting");
    document.body.classList.add("app--ready");
  });

  const tryExampleBtn = document.getElementById("convert-try-example");
  const switchPasteBtn = document.getElementById("convert-switch-paste");
  if (tryExampleBtn) {
    tryExampleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      exampleEl.value = "technical-report";
      loadExample("technical-report");
    });
  }
  if (switchPasteBtn) {
    switchPasteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setConvertInputMode("paste");
    });
  }
})();
