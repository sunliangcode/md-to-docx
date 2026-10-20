# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Contributor Covenant Code of Conduct (`CODE_OF_CONDUCT.md`)
- EditorConfig (`.editorconfig`) for consistent indentation across editors
- Ruff lint/format config in `pyproject.toml` and a dedicated CI `lint` job
- pytest-cov with an 83% branch-coverage floor on the Python 3.12 CI matrix cell
- `pre-commit` config (Ruff + basic file hygiene hooks)
- Progressive mypy gate on public modules (`api`, `errors`, `ast.nodes`, `preset`, `paths`, `validate`) + CI `typecheck` job
- CI `audit` job via `pip-audit` in a clean venv (Dependabot already covers pip/npm/Actions)
- Dev dependency floor `pillow>=12.3.0` for known vulnerability fixes
- `SUPPORT.md` community help routing
- OMML unit tests and in-process CLI tests (raise coverage; catch block-math xmlns bug)
- Expanded HTML preview and Markdown writer tests (`render/html` ~98%, `write/markdown` ~96%)
- sdist now ships community docs (`CHANGELOG`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `SUPPORT`, `README.zh.md`)
- Release checklist covers lint, mypy, coverage, pip-audit, and sdist community-file checks
- `paths` / `validate` unit tests (asset resolution, xrefs, footnotes, strict mode)
- CI hardening: `permissions: contents: read`, concurrency cancel, pip/npm caches, `fail-fast: false`, extension `npm ci`
- Footnote unit tests and richer DOCX parse coverage (heading helpers, multi-block fixtures)
- Composite Action: pip cache + optional `toc` / `numbering` inputs
- Dependabot groups + PR limits for pip / Actions / npm
- OMML `mover`/`munder`/`mstyle` tests + plaintext math fallback; `render.styles` unit tests
- README badges for Ruff and coverage floor; SECURITY.md response targets and scope
- PEP 561 `py.typed` + `Typing :: Typed` classifier; richer `project.urls`
- Expanded progressive mypy surface (`load`, `plugin.base`, `diff.ast_diff`, `write.markdown`)
- Issue template contact links for Support and Security; OSS baseline table in `references/development.md`

### Fixed

- Agensi listing GitHub URL aligned with the canonical `sunliang11/md-to-docx` repo
- Minor dead assignments / import hygiene caught by Ruff
- `convert()` mypy arg-type when `source` is narrowed after the missing-input guard
- Block math no longer crashes on `qn("xmlns:m")` when inserting `m:oMathPara`

### Changed

- CONTRIBUTING and PR template document lint steps and community expectations
- Dev optional deps include `pytest-cov`, `ruff`, `pre-commit`, `mypy`, and `pip-audit`

## [1.1.1] - 2026-09-07

### Fixed

- Inline Markdown (bold / italic / links / code) now parses into the Document AST instead of raw `**…**` text in DOCX
- Footnote documents no longer crash (`callout_map` NameError); refs render as true Word `footnotes.xml` (not a trailing Notes section)
- Figure `{#fig:id}` / `Table: … {#tbl:id}` captions and `[@fig:…]` cross-refs work after normalizer collapses blank lines
- AST diff no longer crashes on inline `Code` nodes
- Browser extension: Gemini turn order interleaved; batch export waits for content fingerprint change; host access narrowed (webpage export is opt-in); convert endpoint restricted to loopback
- Concurrent Web Playground converts no longer share footnote state or a fixed temp DOCX path
- `apply_preset` no longer overwrites custom `figure_label` / `table_label` / `toc_title` when callers set non-defaults
- VS Code extension spawns the CLI without a shell (avoids injection via `extraArgs`)
- Zip extract path checks use `Path.is_relative_to` instead of string prefix matching

### Changed

- README marks browser extension / VS Code / Obsidian / desktop context menu as experimental vs core surfaces
- Editor install docs use git/source install (not a published PyPI wheel yet); VS Code failure hint matches
- `SECURITY.md` supported versions updated to 1.x
- Browser extension follows preset TOC by default (`toc` omitted); options expose numbering
- Web CORS defaults to loopback origins; set `MD_TO_DOCX_CORS_ORIGINS=*` (or a comma list) for public deploy
- Mermaid render uses a single `mmdc` invocation (PNG); SVG is optional
- Math OMML converter covers more MathML nodes (`msub`, `msubsup`, `mroot`, `mfenced`, `mtable`, …)
- MCP adds `reverse_document` and `diff_documents` tools
- `md-to-docx reverse INPUT` writes `INPUT` with a `.md` suffix in the same directory when `-o` is omitted

### Added

- Web Playground modes: Convert (validate, ODM inserts, community templates, engine HTML preview), Reverse, and Diff
- Dependabot for `browser-extension` npm dependencies
- Optional CI Mermaid job when `mmdc` is available
- Roundtrip fidelity tests for tables, lists, and captions
- Release workflow can publish to PyPI when `PYPI_API_TOKEN` secret is set

## [1.1.0] - 2026-09-03

### Removed

- `--preset wecom` and the pandoc conversion engine (`--engine pandoc`, `MD_TO_DOCX_ENGINE`)
- Bundled `reference-wecom.docx` / `wecom-layout.lua` and `md-to-docx build reference`
- WeCom import guide (`references/wecom-import.md`)
- Pandoc reverse fallback (`md-to-docx reverse --engine pandoc`)
- Separate console script `md-to-docx-mcp` — use `md-to-docx mcp` instead
- Vestigial `engine` parameters on convert/reverse APIs and preset objects

### Fixed

- Codespaces Web Playground startup — wait for `/healthz`, clearer failure logs, `waitFor: postStartCommand`

### Changed

- **Native-only compiler** — Markdown → Document AST → python-docx; no external document converter
- **CLI consolidation** — PATH only installs `md-to-docx`; use `md-to-docx build presets|all` and `md-to-docx mcp`
- Mermaid/captions transforms live in built-in plugins; `MD_TO_DOCX_MERMAID_WIDTH` is honored by `mmdc`
- GitHub Action docs pin to `@v1.1.0` (floating major: `@v1`)
- `editorial` preset available on CLI and bundled in the wheel

### Added (P3A / P3B / P4 Gate A / P2)

- **DOCX reverse** — `md-to-docx reverse in.docx -o out.md`
- **AST diff** — `md-to-docx diff a b [--format text|json|md]`
- **GitHub Action** — `action/action.yml` composite action for CI DOCX builds
- **Plugin API** — `--plugin PATH`, `--no-plugins`; built-in mermaid/math/captions
- **VS Code / Obsidian** editor integrations under `editors/`
- **Python API** (`md_to_docx.api.convert`), **MCP server**, **Web Playground**, **browser extension**
- **Open Document Markdown spec** — `spec/document-markdown.md` (`odm-0.1`)
- **Callouts** — `:::warning`, `:::info`, `:::note` containers
- **Community templates** — `templates/` with contribution guide
- Experimental HTML renderer (`md_to_docx.render.html.render_html`)

## [1.0.0] - 2026-09-02

### Added

- **Native Document AST engine** (default) — Parser → AST → python-docx renderer
- Dual-engine era flags (removed in 1.1.0): `--engine {native,pandoc}`, `--preset wecom`
- `--template`, `--toc`, `--title`, `--author`, `--date`, `--numbering`, header/footer page numbers
- Template presets: `--preset professional|technical|academic|business|report`
- `--check` document validation (`--check --format json`, `--strict`)
- Mermaid rendering in native engine (PNG embed; SVG saved to `{stem}-media/`)
- Math formulas via OMML (basic LaTeX via `latex2mathml`)
- Figure/table captions, cross-references (`{#fig:id}`, `[@fig:id]`), footnotes
- Built-in templates: `assets/reference-native.docx`, `assets/presets/*.docx`

### Changed

- Package layout under `scripts/md_to_docx/` with Hatchling packaging (`md2docx-compiler`)
