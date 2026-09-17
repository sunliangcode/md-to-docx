# aim/ — historical phase plans (archived)

Early-2026 phased execution plans from the WeCom / pandoc dual-engine era.

**Not the active roadmap.** Current truth:

- Product state: [references/roadmap.md](../references/roadmap.md)
- What shipped: [CHANGELOG.md](../CHANGELOG.md)

Prefer updating those files for new work. This directory is archaeology only.

## Phase outcomes

| Phase | Outcome | Status |
|-------|---------|--------|
| P0 | Productization — README, examples, CI hygiene, OSS first screen | Done |
| P1A | Document AST + native DOCX renderer (pandoc later removed) | Done |
| P1B | Templates, TOC, header/footer, CJK quality | Done |
| P1C | Mermaid, OMML math, captions, cross-refs | Done |
| P1D | Presets, quality gates, v1.0 | Done |
| P2A | Python API + MCP + agent Skill matrix | Done |
| P2B | Web Playground + Docker | Done |
| P2C | Browser extension (Export AI to Word) | Done |
| P3A | DOCX↔MD roundtrip, AST diff, GitHub Action | Done |
| P3B | Minimal Plugin API + VS Code / Obsidian | Done |
| P4 Gate A | Document Markdown spec + `templates/` contribution path | Done |

## Still gated (P4 B–D)

Do not build these without external demand (see roadmap):

- **Gate B** — static Marketplace (after real third-party template/plugin PRs)
- **Gate C** — optional Cloud API (open engine + hosted option, after stable traffic)
- **Gate D** — AI document editing in the periphery (DOCX↔AST↔MD), not inside the core

## Strategic constraints worth keeping

- Keep the conversion core open source; do not lock it to one AI vendor API.
- DOCX is the first-class output; do not become a generic format factory.
- Do not leak DOCX API into the Markdown parser; keep Parser → AST → Renderer.

---

## Full archived plans

The sections below are the former multi-file plans (`README.md`, `00-INDEX.md`, `P0`…`P4`), concatenated in original order. Do not treat them as an active execution checklist.

### Table of contents

- [README — historical plans intro](#readme-historical-plans-intro)
- [00-INDEX — execution index](#00-index-execution-index)
- [P0 — productization](#p0-productization)
- [P1A — document engine](#p1a-document-engine)
- [P1B — template / TOC / CJK](#p1b-template-toc-cjk)
- [P1C — Mermaid / math / captions](#p1c-mermaid-math-captions)
- [P1D — v1 release](#p1d-v1-release)
- [P2A — agent / MCP](#p2a-agent-mcp)
- [P2B — web playground](#p2b-web-playground)
- [P2C — browser extension](#p2c-browser-extension)
- [P3A — roundtrip / action](#p3a-roundtrip-action)
- [P3B — editors / plugin API](#p3b-editors-plugin-api)
- [P4 — ecosystem](#p4-ecosystem)

---

## README — historical plans intro

<!-- source: README.md -->

### aim/ — historical plans (archived)

These files capture the original phased execution plans from early 2026 (WeCom / pandoc dual-engine era).

**They are not the active roadmap.** Current product state:

- Native Document AST only (pandoc / `--preset wecom` removed)
- Surfaces: CLI, Python API, MCP, Web, GitHub Action, editors, browser extension
- See [references/roadmap.md](../references/roadmap.md) and [CHANGELOG.md](../CHANGELOG.md)

Keep this directory for archaeology. Prefer updating `references/` and `CHANGELOG.md` for new work.

---

## 00-INDEX — execution index

<!-- source: 00-INDEX.md -->

### md-to-docx 分阶段实现计划（执行总表）

> **ARCHIVED / HISTORICAL** — See [`aim/README.md`](#readme-historical-plans-intro). This index describes the pre–native-only plan (WeCom / pandoc). Do not execute these plans against the current tree.
>
> 产品战略原文：`aim.md` *(aim.md — not in this archive)*
> 仓库快照日期：2026-09-02（archived）
> 当时版本：`0.1.0`（Beta）
> 当时定位：WeCom 企微导入专用 Markdown → DOCX（pandoc 管道）
> 当前产品：native Document AST only — see `references/roadmap.md`

---

#### 给执行本计划的 AI Agent

**Stop.** This file is archived. Use `references/roadmap.md` and the live code under `scripts/md_to_docx/`.

<details>
<summary>Original agent instructions (historical)</summary>

你一次只执行 **一个** plan 文件。不要跨阶段提前实现 Web / MCP / 浏览器插件 / VS Code / Marketplace。

##### 开工前必读（按顺序）

1. 本文件（知道现在该做哪一份）
2. `aim.md` *(aim.md — not in this archive)* 对应阶段的「目标 / 不要做什么」
3. 当前要执行的那份 `P*.md`
4. 仓库真实代码：`scripts/md_to_docx/`、`tests/`、`README.md`、`pyproject.toml`

</details>


##### 执行协议

1. 打开本文件，找到第一个 **Status = `TODO`** 且依赖已全部 `DONE` 的 plan。
2. 把该 plan 的 Status 改成 `IN PROGRESS`。
3. 严格按该 plan 的 Task 顺序做。每个 Task 都有：改哪些文件、怎么实现、怎么验证、完成定义。
4. 不要做该 plan「Out of scope」和「禁止」列出的事。
5. 全部 Task 的验收命令通过后，把 Status 改成 `DONE`，并更新本文件的勾选框。
6. 停下来。把验证证据（命令 + 关键输出）写进该 plan 文末 `## Execution log`。等人类确认后再开下一份。
7. 不要在本阶段提交「顺手重构」。现有 pandoc 管道在 P1A 完成前必须继续可用。

##### 硬约束（所有阶段通用）

- 不要把核心引擎闭源，不要做成必须绑定某一家 AI API 的 wrapper。
- 不要让 DOCX API 泄漏进 Markdown Parser。
- 不要为单个场景堆 `if template == "..."`。
- 不要删除 WeCom 能力：它变成 `--preset wecom`，不是被扔掉。
- 不要在 Phase 0 做引擎重写。
- 测试：每个行为变化必须有 pytest；DOCX 质量用 XML 断言（参考 `tests/test_docx_output.py`）。
- 用户可见变化写入 `CHANGELOG.md`。
- 未经用户明确要求，不要 `git commit` / `git push`。

##### 完成一个 plan 的最低证据

```bash
pip install -e ".[dev]"
pytest tests/ -v
python -m md_to_docx --help
./bin/convert --help
```

个别 plan 会追加自己的验收命令。那些命令也必须通过。

---

#### 当前仓库事实（写计划时已核对）

| 已有 | 没有 |
|------|------|
| CLI：`python -m md_to_docx` / `bin/convert` | Document AST |
| pandoc + Lua filter + `reference-wecom.docx` | 原生 DOCX Renderer |
| Markdown normalizer | `--template` / `--preset`（除 WeCom 写死） |
| Mermaid → PNG（mmdc） | 原生 TOC / 页眉页脚 / OMML 公式 |
| pytest + CI（3.10/3.11/3.12） | `examples/` 展示库 |
| CHANGELOG / CONTRIBUTING / MIT LICENSE | Logo、Demo GIF、Before/After |
| 双语 README（但第一屏是企微工具） | Issue/PR 模板、CODEOWNERS、Dependabot、SECURITY.md、Release workflow |
| Cursor `SKILL.md` | MCP / Web / 浏览器插件 / VS Code / Action |

转换管道（现状）：

```
.md → normalize → mermaid PNG → pandoc + reference-wecom.docx + wecom-layout.lua → .docx
```

包布局：`scripts/md_to_docx/`（hatchling `dev-mode-dirs = ["scripts"]`）。P0/P1 不要把包搬到 `src/`。

PyPI 包名 `md-to-docx` **已被占用**。GitHub 仓库名保持 `md-to-docx`。发布名在 P1D 才拍板，P0 不发 PyPI。

---

#### 阶段地图

```
P0 产品化          ── 让 GitHub 第一屏像成熟开源项目
        │
        ▼
P1A Document Engine ── Parser → AST → Renderer（pandoc 降为 fallback）
        │
        ▼
P1B Template/TOC/CJK ── 模板系统、目录、页眉页脚、中文质量
        │
        ▼
P1C Differentiator  ── Mermaid SVG、OMML 公式、Caption、交叉引用
        │
        ▼
P1D v1.0            ── Preset、质量闸门、发版
        │
        ▼
P2A Agent/MCP       ── Skill 矩阵 + MCP（AI 不进核心引擎）
        │
        ▼
P2B Web Playground  ── 30 秒体验 + Docker
        │
        ▼
P2C Browser Ext     ── Export AI to Word
        │
        ▼
P3A Roundtrip       ── DOCX↔MD、Diff、GitHub Action
        │
        ▼
P3B Editors/Plugins ── VS Code、Obsidian、最小 Plugin API
        │
        ▼
P4  Ecosystem       ── 模板市场、文档标准、Cloud（引擎继续开源）
```

版本对照（来自 `aim.md` §十二）：

| 版本 | Plan | 一句话 |
|------|------|--------|
| v0.1 | P0 | README / Branding / CI / Examples / Demo |
| v0.2 | P1A | Document AST + Parser + DOCX Renderer |
| v0.3 | P1B | Template + TOC + Header/Footer + CJK |
| v0.4 | P1C | Mermaid + Math + Caption + Cross-ref |
| v1.0 | P1D | Professional Markdown → DOCX |
| v1.5 | P2B | Web Playground + Docker + Presets 收口 |
| v2.0 | P2A | Agent Skill + MCP + AI → Word |
| v2.5 | P2C | Browser Extension |
| v3.0 | P3A | Roundtrip + Diff + Action + VS Code 起步 |
| v3.5 | P3B | Plugin API + Obsidian |
| v4.0 | P4 | Standard + Marketplace + Cloud |

---

#### Plan 清单与状态

执行顺序就是表格顺序。把 `TODO` 改成 `IN PROGRESS` / `DONE`。

| # | 文件 | 阶段 | 目标版本 | 依赖 | Status |
|---|------|------|----------|------|--------|
| 0 | [00-INDEX.md](#00-index-execution-index) | — | — | — | 本表 |
| 1 | [P0-productization.md](#p0-productization) | Phase 0 | 0.1.x | 无 | TODO |
| 2 | [P1A-document-engine.md](#p1a-document-engine) | Phase 1 | 0.2.0 | P0 | TODO |
| 3 | [P1B-template-toc-cjk.md](#p1b-template-toc-cjk) | Phase 1 | 0.3.0 | P1A | TODO |
| 4 | [P1C-mermaid-math-caption.md](#p1c-mermaid-math-captions) | Phase 1 | 0.4.0 | P1B | TODO |
| 5 | [P1D-v1-release.md](#p1d-v1-release) | Phase 1 | 1.0.0 | P1C | TODO |
| 6 | [P2A-agent-mcp.md](#p2a-agent-mcp) | Phase 2 | 2.0.0 | P1D | DONE |
| 7 | [P2B-web-playground.md](#p2b-web-playground) | Phase 2 | 1.5 / 2.0 | P1D | DONE |
| 8 | [P2C-browser-extension.md](#p2c-browser-extension) | Phase 2 | 2.5.0 | P2A, P2B | DONE |
| 9 | [P3A-roundtrip-action.md](#p3a-roundtrip-action) | Phase 3 | 3.0.0 | P2A | TODO |
| 10 | [P3B-editors-plugin-api.md](#p3b-editors-plugin-api) | Phase 3 | 3.5.0 | P3A | TODO |
| 11 | [P4-ecosystem.md](#p4-ecosystem) | Phase 4 | 4.0.0 | P3B | DONE |

P2A 与 P2B 可在 P1D 完成后并行（两个 agent / 两个分支），但不要和 P0–P1 并行。

---

#### 北极星与阶段健康指标（不要把 Star 当硬 KPI）

北极星：**Monthly Documents Generated**（最终量级参考：100,000 / month）。

| 阶段 | Star 参考 | Release | 真正要盯的 |
|------|-----------|---------|------------|
| P0 | 0 → 50 | v0.1.x | 首页 10 秒看懂；clone 后 1 条命令出 DOCX |
| P1 | 50 → 500 | v1.0 | 转换质量（CJK、表格、代码块、目录） |
| P2 | 500 → 2K | v2.0 | AI 用户 30 秒出 Word（Playground / Skill / MCP） |
| P3 | 2K → 5K | v3.0 | 可编程文档（roundtrip、Action、插件） |
| P4 | 5K → 10K+ | v4.0 | 别人提交模板 / 插件 |

---

#### 架构终局（后面所有 plan 必须朝这里收敛）

```
Input: Markdown | DOCX | AI Markdown
        ↓
     Parser
        ↓
   Document AST
        ↓
 Transformer / Template / Plugin
        ↓
     Renderer
        ↓
   DOCX (第一公民) | PDF | HTML
```

外围入口（按阶段解锁，禁止提前）：CLI → Skill → MCP → Web → Browser → Action → VS Code → Obsidian。

DOCX 永远是第一公民。不要做成万能格式转换器。

---

## P0 — productization

<!-- source: P0-productization.md -->

### P0 — 项目产品化（v0.1.x）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** [`00-INDEX.md`](#00-index-execution-index), `aim.md` *(aim.md — not in this archive)*「Phase 0」
> **Depends on:** none
> **Unblocks:** P1A
> **Target version:** keep `0.1.0` until this plan's last task; then bump to `0.1.1` only if you ship behavior changes. Branding-only can stay `0.1.0`.
> **Estimated scope:** 1–2 days for an AI agent. No engine rewrite.

---

#### Execution contract

##### Goal

让陌生人打开 GitHub 仓库 10 秒内知道：这是 AI 时代的开源文档编译器，能把 Markdown / AI 生成内容变成可交付的专业 Word。然后一条命令就能跑通。

##### 禁止（违反即失败）

- Web SaaS、MCP、浏览器插件、VS Code、Obsidian、Template Marketplace、新的 AI Agent 产品
- 重写转换引擎、引入 Document AST、换掉 pandoc
- 删除 WeCom / 企微导入能力
- 发布 PyPI（包名 `md-to-docx` 已被占用，P1D 再拍板）
- 把 README 第一屏继续写成「企微专用小工具」
- 大改 `scripts/md_to_docx/` 的转换逻辑（本阶段只允许为 examples / demo 需要的最小 CLI 文案改动）

##### 允许改动的目录

- `README.md` / `README.zh.md`
- `SKILL.md`（只改定位句，不改工作流）
- `CHANGELOG.md` / `CONTRIBUTING.md`
- `examples/`（新建）
- `assets/branding/`、`assets/demo/`（新建）
- `.github/`（模板、Dependabot、Release、CODEOWNERS、SECURITY.md）
- `pyproject.toml`（description / keywords / urls 文案，不改依赖除非例子脚本需要）
- `references/`（增加 `examples.md` 链接，不重写转换原理）

##### Done when

- [ ] GitHub 第一屏：定位句 + Before/After + 一条安装/运行命令 + Demo
- [ ] `examples/` 七套样例齐全，每套能被当前 CLI 转出非空 `.docx`
- [ ] Issue / PR 模板、SECURITY.md、Dependabot、Release workflow 存在
- [ ] 现有 `pytest tests/ -v` 全绿
- [ ] WeCom 文档入口仍在 README 里，但是「Preset / 使用场景」而不是唯一身份

---

#### 当前状态（2026-09-02 已核对）

第一屏现状（`README.md` L3–L13）：标题 `md-to-docx`，副标题是 WeCom smart-document import，管道写死 pandoc。

已有工程化：`.github/workflows/ci.yml`、`.github/workflows/star-history.yml`、`CHANGELOG.md`、`CONTRIBUTING.md`、`LICENSE`（MIT）。

没有：`examples/`、Issue 模板、PR 模板、CODEOWNERS、Dependabot、SECURITY.md、Release workflow、Logo、Demo GIF。

CLI 可用：

```bash
./bin/convert report.md
python -m md_to_docx report.md
python -m md_to_docx ./docs --output-dir ./output --dry-run
```

转换不修改源 `.md`。默认排除 `README.md`、`CHANGELOG.md`、`SKILL.md`、`.github/**`。

---

#### 锁定决策（不要再讨论）

1. **产品一句话（英文，README H1 下）：** `The open-source document compiler for the AI era.`
2. **产品一句话（中文）：** `把 Markdown / AI 生成内容，编译成可交付的专业 Word 文档。`
3. **视觉：** 极简 `MD → DOCX` 或 `# → W`。单色，适配 GitHub 亮/暗。不做复杂吉祥物。
4. **WeCom：** 保留，降为使用场景和 `--` 文档里的「企业微信导入」。本阶段不加 `--preset` flag（那是 P1B/P1D）。
5. **PyPI：** 本阶段不发布。README 继续诚实写「从源码安装」。
6. **Demo：** 两层。Layer A（必须）：CLI 终端 GIF + 静态 Markdown / 伪 Word 对比图。Layer B（人类可选）：用 Word / 企微真机截图替换伪 Word 图。
7. **Examples 的 `.docx`：** 提交到 git，让 GitHub 可预览下载。生成脚本必须可重复。`.gitignore` 里 `tests/fixtures/*.docx` 保持忽略，不要误伤 `examples/**/*.docx`。
8. **品牌文件前缀：** `assets/branding/logo.svg`、`assets/demo/hero.gif`。

---

#### Task 0 — 建立本 plan 的工作分支约定

**不做 git 操作，除非用户要求。** 只在工作区改文件。

确认仓库可运行：

```bash
python3 -m pytest tests/ -v
./bin/convert --help
python -m md_to_docx --version
```

期望：测试通过；help 含 `--dry-run` `--output-dir`；version 含 `0.1.0`。

失败则先修环境（pandoc、`pip install -e ".[dev]"`），不要开始 Task 1。

---

#### Task 1 — 重写 README 第一屏（英文）

**文件：** `README.md`（整页重构，保留后半的文档链接 / Skill / License / Star History）

##### 第一屏必须按这个结构写（顺序锁定）

1. 语言切换：`English | [中文](README.zh.md)`
2. Badge 行：License、CI（`https://github.com/sunliang11/md-to-docx/actions/workflows/ci.yml`）、Python 3.10+。不要加假的 PyPI badge。
3. H1：`md-to-docx`
4. 定位句（英文）+ 一行解释：`Turn Markdown and AI-generated content into professional Word documents.`
5. 三个链接式 CTA（Markdown 链接，不是尚未存在的网站）：
   - `[Documentation](references/installation.md)`
   - `[Examples](examples/README.md)`
   - `[GitHub](https://github.com/sunliang11/md-to-docx)`
6. Hero 图：`assets/demo/hero.gif`（Task 4 会生成；先写 img 标签，Task 4 落地文件）
7. Before / After 小节：左 Markdown 代码块（短），右指向 `assets/demo/after.png` 或伪 Word 预览图
8. Quick Start：git clone + `./bin/convert report.md`（skill-first，不要把 pip 当第一路径）
9. Pipeline 一行：`Markdown / AI output → md-to-docx → Professional DOCX`
10. Features 短列表（只写**现在真的有的**）：
    - Headings, lists, tables, code blocks, blockquotes, images
    - CJK-aware reference template
    - Mermaid diagrams → PNG
    - Batch directory conversion
    - Cursor Agent Skill
    - WeCom smart-doc import (optional workflow)
11. 「What's next」用 3 行指向 AST / templates / AI 入口，明确这些是 roadmap，不要假装已经有 Web Playground
12. 原有 Documentation / Cursor Skill / License / Star History 区块保留并更新文案

##### 关键词（自然写进第一段和 Features，不要堆砌 keyword stuffing）

`markdown to docx`、`markdown to word`、`AI to Word`、`ChatGPT to Word`、`document compiler`

##### 不要写的句子

- 「Batch-convert Markdown to Word DOCX for WeCom」作为第一句
- 「Not published on PyPI」放第一屏（放到 Install 小节即可）
- 任何「Online Playground」死链

##### 安装小节要求

保留两条路径：

```bash
git clone https://github.com/sunliang11/md-to-docx.git
cd md-to-docx
./bin/convert path/to/report.md
```

和可选 `pip install -e .`。Requirements 写清：Python 3.10+、pandoc 3.x、mmdc 仅 Mermaid 需要。

##### 完成定义

- 打开 `README.md`，前 40 行不出现「企业微信」/「WeCom」作为主定位（WeCom 可以在 Features 或后文出现）
- 前 40 行包含 `document compiler` 或 `AI-generated content`
- Star History HTML 注释块 `<!-- star-history:start -->` 原样保留

---

#### Task 2 — 重写 README.zh.md 第一屏

**文件：** `README.zh.md`

与英文版结构一一对应。定位句用：

```
### md-to-docx

AI 时代的开源文档编译器。

把 Markdown / AI 生成内容，编译成可交付的专业 Word 文档。
```

WeCom 放在「使用场景」：

```markdown
#### 使用场景

- 把 ChatGPT / Claude / Cursor 的 Markdown 变成可提交的 Word
- 技术方案、周报、API 文档、会议纪要
- 企业微信智能文档导入（保留原有优化管道）
```

完成定义：中英文 CTA / 章节顺序一致；中文第一屏不以企微为主定位。

---

#### Task 3 — Logo / 品牌 SVG

**新建：**

```
assets/branding/logo.svg          # 正方形 icon，GitHub 头图可用
assets/branding/wordmark.svg      # 横版 MD → DOCX
assets/branding/README.md         # 使用说明（尺寸、颜色、在哪引用）
```

##### 视觉规格（锁定）

- 画板：`logo.svg` 128×128；`wordmark.svg` 640×128
- 背景：透明
- 前景：`#111827`（near-black）。不要渐变、不要阴影、不要 3D
- logo 内容：上半 `#` 或 `MD`，中间细箭头 `↓`，下半 `W` 或 `DOCX`
- 深色模式：README 用 `<picture>` 不是必须。SVG 用 `currentColor` 或纯深色即可（GitHub 亮色 README 为主）
- 禁止：吉祥物、照片、AI 网红风紫渐变、超过 2 种颜色

`assets/branding/README.md` 写：

```markdown
### Branding

- `logo.svg` — icon
- `wordmark.svg` — MD → DOCX wordmark

Primary ink: #111827
Do not add colors, mascots, or gradients without a new branding task.
```

README 第一屏在 H1 旁或 H1 下嵌入：

```markdown
<img src="assets/branding/wordmark.svg" alt="md-to-docx: MD → DOCX" width="320">
```

##### 完成定义

- 两个 SVG 可在浏览器打开，路径闭合，无外部字体依赖
- `README.md` 引用 wordmark 的相对路径正确

---

#### Task 4 — Demo GIF + Before/After 静图

**新建：**

```
assets/demo/README.md
assets/demo/hero.gif          # CLI 演示，≤ 8MB，建议 < 3MB
assets/demo/before.md.png     # 源 Markdown 视觉
assets/demo/after.png         # 专业文档观感（允许 HTML 伪 Word）
scripts/demo/record_hero.sh   # 可重复生成
scripts/demo/render_after.py  # 可重复生成 after.png
```

##### 4.1 Hero 叙事（10 秒内看懂）

画面顺序锁定：

1. 终端：`./bin/convert examples/technical-report/example.md`
2. 输出：`done: 1/1 succeeded`
3. 提示生成了 `example.docx`
4. （可选最后一帧）after.png 的专业文档画面

不要做「拖入文件 / 选择 Technical Report / Generate」这种 Web UI 叙事——Web 不存在。本阶段 Demo 必须诚实：这是 CLI。

##### 4.2 生成方式（按可用性降级，不要卡住）

**优先 A — vhs（推荐）**

若本机有 [vhs](https://github.com/charmbracelet/vhs)：

```bash
which vhs || brew install vhs
```

新建 `scripts/demo/hero.tape`（vhs 脚本），录制真实命令。输出 `assets/demo/hero.gif`。

**优先 B — asciinema + agg**

```bash
asciinema rec /tmp/md-to-docx.cast
### 跑 ./bin/convert examples/technical-report/example.md
agg /tmp/md-to-docx.cast assets/demo/hero.gif
```

**允许 C — 静态帧合成 GIF（无录屏工具时）**

用 Python `pillow` 生成 4–6 帧伪终端画面（黑底绿/白字，等宽字体），合成 GIF。在 `assets/demo/README.md` 标明 `placeholder — replace with real recording`。

**禁止：** 下载网图当 Demo；用无关项目的 GIF。

##### 4.3 After 图

写 `scripts/demo/render_after.py`：用 Pillow 画一张「Word 纸面」：

- 白底，浅灰页边
- 标题「Technical Report」
- H2「Architecture」
- 一段中英混排
- 一个三列表格
- 一个深色代码块

导出 `assets/demo/after.png`（宽 900px）。这是占位专业感，Task 完成后在 `assets/demo/README.md` 写：`Human: replace after.png with a real Word / WeCom screenshot when available.`

Before 图：把 `examples/technical-report/example.md` 前 30 行用 Pillow 画成等宽文本图 `before.md.png`。

##### 4.4 README 引用

```markdown
![Convert Markdown to DOCX](assets/demo/hero.gif)

**Before** (Markdown) → **After** (Word)

<img src="assets/demo/before.md.png" width="48%"> <img src="assets/demo/after.png" width="48%">
```

##### 完成定义

- `assets/demo/hero.gif` 存在且 > 10KB
- `before.md.png` / `after.png` 存在
- README 图片相对路径能解析
- `scripts/demo/` 里有可重复脚本；README.zh 同步引用

---

#### Task 5 — Examples 库

**新建目录（名称锁定，与 aim.md 一致）：**

```
examples/
├── README.md
├── technical-report/
├── business-report/
├── academic-paper/
├── api-document/
├── meeting-notes/
├── ai-report/
└── chinese-report/
```

每个子目录必须有：

```
example.md
example.docx
preview.png
README.md
```

##### 5.1 每个 example.md 的内容规格

| 目录 | 主题 | 必须包含的 Markdown 结构 |
|------|------|--------------------------|
| technical-report | 系统设计（可虚构「文档编译器架构」） | H1–H3、表格、代码块、Mermaid flowchart、中英混排 |
| business-report | 季度业务综述 | H1–H2、KPI 表格、引用块、无序列表 |
| academic-paper | 短论文结构 | Abstract、编号列表、引用块、一张表 |
| api-document | HTTP API | 标题、代码块（json/http）、参数表 |
| meeting-notes | 会议纪要 | 任务列表 `- [ ]`、日期、决策列表 |
| ai-report | 模拟 Claude/ChatGPT 导出的技术方案 | 典型 AI 腔但结构完整：Overview / Design / Risks |
| chinese-report | 纯中文技术方案 | 中文标题「一、二、三」、中文表格、中文代码注释 |

每个 `example.md`：80–200 行。不要空壳标题。technical-report 必须含一个 ```` ```mermaid ```` flowchart（CI 里 examples 转换可以 skip mermaid 若无 mmdc——见 5.4）。

YAML frontmatter 可以写但不被当前引擎消费。允许：

```markdown
---
title: Technical Report
author: md-to-docx
---
```

##### 5.2 每个子 README.md

固定小节：

```markdown
### <Name>

What this example shows.

#### Convert

```bash
./bin/convert examples/<dir>/example.md
```

Output: `examples/<dir>/example.docx`
```

##### 5.3 examples/README.md

表格列出 7 个例子 + 一句话 + 链接。顶部说明：

```markdown
These examples are converted with the current pandoc pipeline (v0.1).
Native Document AST lands in v0.2 (see aim/P1A-document-engine.md).
```

##### 5.4 生成 docx 与 preview

新建 `scripts/demo/build_examples.sh`：

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export PYTHONPATH="${ROOT}/scripts${PYTHONPATH:+:$PYTHONPATH}"
cd "$ROOT"
for d in examples/*/ ; do
  python3 -m md_to_docx "${d}example.md"
done
```

对 technical-report：若无 `mmdc`，example.md 仍可保留 mermaid 块，但 `build_examples.sh` 在无 mmdc 时打印 skip 并失败码 0 之外的提示——**更好的做法：** technical-report 的 mermaid 保留，文档写清需要 mmdc；CI 的 examples job 安装 mermaid-cli 太重，P0 的 CI **不要** 强依赖 mermaid。因此：

- `technical-report/example.md` 的 mermaid 用一个**小** flowchart（< 15 行）
- `build_examples.sh`：检测到 mermaid 且无 mmdc 时，对该文件用 `sed` 临时注释？**不要改源文件。**
- 锁定：本机生成 `example.docx` 时，执行者必须有 pandoc。Mermaid 文件：如果转换因缺 mmdc 失败，把该 mermaid 块改成「已渲染示意图」的普通 `![architecture](preview-architecture.png)` **另外**保留一份 `diagram.mmd.md`？太碎。

**最终锁定：** 7 个例子里只有 `technical-report` 含 mermaid。`build_examples.sh` 若 `mmdc` 缺失，对 technical-report 打印 warning 并继续（转换会失败）——不行。

改为：P0 的 `technical-report/example.md` **内嵌 mermaid，同时提交一张** `architecture.png`（可用 Task 4 的 Pillow 画框图）。正文用：

````markdown
```mermaid
flowchart LR
  A[Markdown] --> B[md-to-docx] --> C[DOCX]
```
````

以及：

```markdown
![Architecture](architecture.png)
```

这样无 mmdc 时，CLI 仍因 mermaid 失败。所以 **P0 technical-report 不要放 mermaid fence**。在该例 README 写：`Mermaid fences are supported by the converter when mmdc is installed. This example uses a static PNG so the example builds anywhere with pandoc.`

差异化 mermaid 演示放到 P1C。P0 只承诺：例子能在「仅 pandoc」环境转成功。

##### 5.5 preview.png

每个例子用 Pillow 生成一张 800px 宽的「第一页预览」占位图（标题 + 2 段文字），文件名 `preview.png`。`scripts/demo/render_previews.py` 读取 example.md 的 H1 和前 2 个段落生成。人类以后可替换成真 Word 截图。

##### 5.6 .gitignore

确认 `tests/fixtures/*.docx` 不会忽略 `examples/**/example.docx`。当前规则是 `tests/fixtures/*.docx`，安全。不要加 `*.docx` 全局忽略。

##### 完成定义

```bash
bash scripts/demo/build_examples.sh
test -s examples/technical-report/example.docx
test -s examples/chinese-report/example.docx
### 7 个 docx 都非空
find examples -name example.docx | wc -l   # = 7
```

`./bin/convert examples/meeting-notes/example.md` 退出码 0。

---

#### Task 6 — GitHub 工程化

##### 6.1 Issue templates

新建：

```
.github/ISSUE_TEMPLATE/config.yml
.github/ISSUE_TEMPLATE/bug_report.yml
.github/ISSUE_TEMPLATE/feature_request.yml
```

`config.yml`：

```yaml
blank_issues_enabled: false
contact_links:
  - name: Documentation
    url: https://github.com/sunliang11/md-to-docx/blob/main/references/installation.md
    about: Install, pandoc, mermaid troubleshooting
```

`bug_report.yml` 必填字段：

- 描述
- 复现步骤
- 期望 / 实际
- `md-to-docx --version` 输出
- `pandoc --version` 第一行
- OS
- 是否含 Mermaid
- 可附最小 `.md` 片段（textarea）

`feature_request.yml` 必填：问题、建议、是否愿提交 PR。描述里加一句：Phase 0 不接受 Web/MCP/插件类功能请求作为「现在就做」（可记 roadmap）。

##### 6.2 PR 模板

新建 `.github/pull_request_template.md`：

```markdown
#### Summary

#### Test plan

- [ ] `pytest tests/ -v`
- [ ] `./bin/convert --help`

#### Docs

- [ ] CHANGELOG.md updated if user-visible
```

##### 6.3 CODEOWNERS

新建 `.github/CODEOWNERS`：

```
* @sunliang11
```

若 GitHub 用户名不是 sunliang11，改为仓库 owner。从 `git remote get-url origin` 读取。

##### 6.4 Dependabot

新建 `.github/dependabot.yml`：

```yaml
version: 2
updates:
  - package-ecosystem: pip
    directory: "/"
    schedule:
      interval: weekly
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
```

##### 6.5 SECURITY.md

新建仓库根 `SECURITY.md`：

- 支持版本：当前 `0.1.x`
- 报告方式：GitHub Security Advisory（private）
- 不要承诺 SLA

##### 6.6 Release workflow

新建 `.github/workflows/release.yml`：

- trigger：`push tags: ['v*']`
- jobs：checkout、setup-python 3.12、`pip install -e ".[dev]" build`、`pytest`、`python -m build`
- 用 `softprops/action-gh-release@v2` 把 `dist/*.whl` `dist/*.tar.gz` 挂到 GitHub Release
- **不要** 配置 PyPI publish
- 需要 `permissions: contents: write`

##### 6.7 CI 小增强（不要大改）

编辑 `.github/workflows/ci.yml`，在现有 test job 之后或同一 job 末尾加：

```yaml
      - name: Convert examples (pandoc only)
        run: |
          for f in examples/*/example.md; do
            python -m md_to_docx "$f"
            test -s "${f%.md}.docx"
          done
```

若 examples 尚未在同一 PR 落地，这个 step 必须和 Task 5 同一批提交，否则 CI 红。

给 `contributors` 权限无变化。不要加 mermaid-cli 安装（太慢/易碎）。

##### 完成定义

- 上述文件都存在且 YAML 可被 GitHub 解析（缩进 2 空格）
- CI 文件仍在 3.10/3.11/3.12 matrix 跑 pytest
- 无 PyPI token / secret 引用

---

#### Task 7 — 文案对齐（包元数据、Skill、贡献指南）

##### 7.1 pyproject.toml

更新：

```toml
description = "The open-source document compiler for the AI era. Markdown / AI output → professional DOCX."
keywords = ["markdown", "docx", "word", "pandoc", "ai", "document-compiler", "mermaid", "wecom"]
```

增加：

```toml
[project.urls]
Homepage = "https://github.com/sunliang11/md-to-docx"
Documentation = "https://github.com/sunliang11/md-to-docx#readme"
Issues = "https://github.com/sunliang11/md-to-docx/issues"
```

不要改 `name = "md-to-docx"`（本地包名可保持；反正不发 PyPI）。不要改 version。

##### 7.2 SKILL.md

只改 `description` 和 H1 下第一句，让 Agent 知道产品定位变了，但 **工作流步骤保持 skill-first / 禁止乱 pip**。

description 建议：

```
Converts Markdown and AI-generated content to professional Word DOCX (pandoc + optional mermaid-cli).
WeCom smart-doc import remains a supported workflow. Use when the user wants md→docx, batch convert, or 企微导入.
```

Agent workflow 6 步不要删。

##### 7.3 CONTRIBUTING.md

在 Project layout 加上 `examples/`、`assets/branding/`、`assets/demo/`。

加一节 **Scope**：

```markdown
#### Scope (Phase 0)

Please do not open PRs for a web app, MCP server, browser extension, or marketplace.
The current milestone is: make Markdown → DOCX excellent and the GitHub page trustworthy.
See `aim/` for the roadmap.
```

##### 7.4 CHANGELOG.md

在 `[Unreleased]` Added：

- Reposition README as an AI-era document compiler (WeCom remains a supported workflow)
- Examples gallery
- GitHub issue/PR templates, SECURITY.md, Dependabot, release workflow
- Branding and demo assets

##### 7.5 references/installation.md

开头加 3 行指向新定位，安装步骤不改。

新建 `references/roadmap.md`：10 行，链到 `aim/00-INDEX.md`，避免用户以为 Web 已经存在。

README Documentation 列表加上 Roadmap 链接。

##### 完成定义

```bash
python -c "import tomllib; print(tomllib.load(open('pyproject.toml','rb'))['project']['description'])"
```

输出含 `document compiler`。`SKILL.md` frontmatter 仍只有 `name` 和 `description` 两键（现有约定）。

---

#### Task 8 — 回归与验收

按顺序跑：

```bash
pip install -e ".[dev]"
pytest tests/ -v
./bin/convert --help
python -m md_to_docx --version
python -m md_to_docx tests/fixtures/sample.md --output-dir /tmp/md2docx-p0
test -s /tmp/md2docx-p0/sample.docx
bash scripts/demo/build_examples.sh
find examples -name example.docx -size +1k | wc -l
```

期望：

- pytest 全绿（与 P0 之前数量相比不允许减少）
- examples 7 个 docx 都 > 1KB
- README.md 相对图片全部存在：

```bash
python3 - <<'PY'
from pathlib import Path
import re
text = Path("README.md").read_text()
paths = re.findall(r"\((assets/[^)]+)\)", text)
paths += re.findall(r'src="(assets/[^"]+)"', text)
missing = [p.split()[0] for p in paths if not Path(p.split()[0]).exists()]
print("checked", len(paths), "missing", missing)
raise SystemExit(1 if missing else 0)
PY
```

##### README 人工检查清单（agent 用 Read 工具自检）

- [ ] 第一屏不是 WeCom-first
- [ ] 有 wordmark 或 logo
- [ ] 有 hero.gif
- [ ] 有 examples 链接
- [ ] clone + `./bin/convert` 仍是最快路径
- [ ] Star History 块未损坏
- [ ] 中文 README 同步

---

#### Out of scope（记入 P1+，本 plan 禁止做）

- Document AST / 换引擎
- `--template` `--preset`
- 原生 TOC / 页眉 / OMML
- PyPI 改名发布
- 网站
- 把 WeCom Lua filter 删掉

---

#### Handoff to P1A

P0 完成后，产品看起来像成熟开源项目，引擎仍是 pandoc。

P1A 将引入 `Document AST`，并把 pandoc 变成 `--engine pandoc` fallback。不要在 P0 预埋空的 `ast/` 包。

---

#### Execution log

**2026-09-02** — P1A–P1D implemented. v1.0.0. pytest 92 passed. Native engine default.

---

## P1A — document engine

<!-- source: P1A-document-engine.md -->

### P1A — Document Engine：AST + Parser + DOCX Renderer（v0.2.0）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P0 `DONE`。[`00-INDEX.md`](#00-index-execution-index)、`aim.md` *(aim.md — not in this archive)*「Phase 1 / Document AST / 技术原则」
> **Depends on:** P0
> **Unblocks:** P1B
> **Target version:** `0.2.0`
> **Estimated scope:** 3–5 days. 这是整个仓库最重要的技术决策落地。

---

#### Execution contract

##### Goal

把转换管道从「normalize + pandoc 一把梭」改成：

```
Markdown → Parser → Document AST → Transformer → DOCX Renderer
```

pandoc 路径保留为 `--engine pandoc`，用于回归对照和 WeCom 旧行为。默认引擎改为 `native`。

##### 禁止

- 在 Parser 里 `from docx import Document` 或任何 python-docx / lxml OOXML
- `if template == "technical":` 这种模板分支（模板是 P1B）
- 实现完整 TOC / Header-Footer / Preset / OMML / Caption（P1B/P1C）
- 删除 pandoc 路径、删除 WeCom Lua filter、删除 `reference-wecom.docx`
- 把包从 `scripts/md_to_docx` 迁到 `src/`
- Web / MCP / 插件 API
- 为「支持所有 Markdown 方言」无限加语法。本阶段只锁定：CommonMark + GFM + 我们列出的少量扩展

##### Done when

- [ ] 存在独立 AST 模块，可用 pytest 构造文档树并 roundtrip 打印
- [ ] `python -m md_to_docx x.md` 默认走 native renderer，产出可被 Word 打开的 docx（即合法 ZIP+OOXML）
- [ ] `--engine pandoc` 仍通过现有 `tests/test_docx_output.py` 行为（或显式标记为 pandoc-engine tests）
- [ ] native 引擎有自己的 XML 断言：heading / paragraph / list / table / code / link / quote / image / CJK 字体
- [ ] Parser 文件 `grep -n "docx\|OxmlElement\|qn(" scripts/md_to_docx/parse scripts/md_to_docx/ast` 无匹配

---

#### 锁定决策

1. **AST 用 dataclasses，不用 pydantic。** 标准库即可，树节点要可比较（`eq=True`）方便单测。
2. **Parser 用 `markdown-it-py` + `mdit-py-plugins`（GFM / frontmatter / tasklists / dollarmath 先不启用 dollarmath——数学是 P1C）。** 不要用 `pandoc -t json` 当主 parser（那会让 native 引擎仍依赖 pandoc）。
3. **Renderer 用 `python-docx`。** 把它从 `[project.optional-dependencies] dev` 提升到 `[project] dependencies`。
4. **默认 `--engine native`。** `MD_TO_DOCX_ENGINE` env 可覆盖。`pandoc` 仍是合法值。
5. **WeCom：** `--engine pandoc` 保持现有 Lua + reference-wecom 行为，单测不丢。native 引擎用同一套 CJK 字体默认值（微软雅黑 + Consolas），但不跑 Lua。
6. **Normalizer：** 现有 `normalizer.py` 继续作为 parse 前的可选 preprocess，由 `--normalize / --no-normalize` 控制，默认 `on`（兼容当前「修烂 Markdown」价值）。Normalizer 输出仍是 Markdown 字符串，不是 AST。
7. **Mermaid：** native 引擎 P1A **原样保留 fence 为 `CodeBlock(lang="mermaid")`**，不调用 mmdc。P1C 再变成 `Mermaid` 节点 + SVG。pandoc 引擎继续现有 PNG 流程。
8. **版本：** `scripts/md_to_docx/__init__.py` 与 `pyproject.toml` 改为 `0.2.0`。更新 `tests/test_cli.py` 的版本断言，不要写死只接受 `0.1.0`。

---

#### 目标包结构（必须按此创建）

```
scripts/md_to_docx/
  __init__.py              # version 0.2.0；可 re-export convert API
  __main__.py              # 不变
  cli.py                   # 加 --engine，转发到 engine
  paths.py                 # 不变
  converter.py             # 拆：保留 pandoc 路径函数；新增 convert() 门面
  normalizer.py            # 不变
  reference.py             # 仍只服务 pandoc reference-wecom
  ast/
    __init__.py            # 导出公共节点类型
    nodes.py               # Document / Block / Inline dataclasses
    visitor.py             # NodeVisitor
  parse/
    __init__.py
    markdown.py            # markdown-it-py → AST
    frontmatter.py         # YAML --- --- 到 Metadata
  render/
    __init__.py
    docx_renderer.py       # AST → python-docx
    styles.py              # 默认样式（字体、代码块底色、表格边框）
  engine/
    __init__.py
    native.py              # normalize? → parse → render
    pandoc.py              # 把现有 convert_one 包装进来
```

不要建空的 `transform/`、`plugin/`。P1B 再加。

---

#### AST 规格（锁定，按此实现 `ast/nodes.py`）

全部节点 `@dataclass(frozen=True, slots=True)`。`Inline` 与 `Block` 用 Union 类型别名，不要深继承超过一层。

```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Literal, Union

Alignment = Literal["left", "center", "right", "default"]

@dataclass(frozen=True, slots=True)
class Text:
    value: str

@dataclass(frozen=True, slots=True)
class Strong:
    children: tuple[Inline, ...]

@dataclass(frozen=True, slots=True)
class Emphasis:
    children: tuple[Inline, ...]

@dataclass(frozen=True, slots=True)
class Strike:
    children: tuple[Inline, ...]

@dataclass(frozen=True, slots=True)
class Code:
    value: str

@dataclass(frozen=True, slots=True)
class Link:
    href: str
    children: tuple[Inline, ...]
    title: str | None = None

@dataclass(frozen=True, slots=True)
class InlineImage:
    src: str
    alt: str = ""
    title: str | None = None

@dataclass(frozen=True, slots=True)
class Break:
    """Hard line break."""

@dataclass(frozen=True, slots=True)
class SoftBreak:
    pass

Inline = Union[
    Text, Strong, Emphasis, Strike, Code, Link, InlineImage, Break, SoftBreak
]

@dataclass(frozen=True, slots=True)
class Heading:
    level: int  # 1-6
    children: tuple[Inline, ...]
    anchor: str | None = None

@dataclass(frozen=True, slots=True)
class Paragraph:
    children: tuple[Inline, ...]

@dataclass(frozen=True, slots=True)
class ListItem:
    children: tuple[Block, ...]
    checked: bool | None = None  # None=not a task; True/False=task

@dataclass(frozen=True, slots=True)
class ListBlock:
    ordered: bool
    items: tuple[ListItem, ...]
    start: int = 1
    tight: bool = True

@dataclass(frozen=True, slots=True)
class TableCell:
    children: tuple[Block, ...]
    align: Alignment = "default"
    header: bool = False

@dataclass(frozen=True, slots=True)
class Table:
    rows: tuple[tuple[TableCell, ...], ...]
    # rows[0] is header if any(cell.header for cell in rows[0])

@dataclass(frozen=True, slots=True)
class CodeBlock:
    text: str
    lang: str | None = None

@dataclass(frozen=True, slots=True)
class BlockQuote:
    children: tuple[Block, ...]

@dataclass(frozen=True, slots=True)
class ThematicBreak:
    pass

@dataclass(frozen=True, slots=True)
class Image:
    src: str
    alt: str = ""
    title: str | None = None

@dataclass(frozen=True, slots=True)
class PageBreak:
    pass

@dataclass(frozen=True, slots=True)
class HTMLBlock:
    """Passthrough; renderer ignores or dumps as text in P1A."""
    raw: str

Block = Union[
    Heading, Paragraph, ListBlock, Table, CodeBlock, BlockQuote,
    ThematicBreak, Image, PageBreak, HTMLBlock,
]

@dataclass(frozen=True, slots=True)
class Metadata:
    title: str | None = None
    author: str | None = None
    date: str | None = None
    extra: tuple[tuple[str, str], ...] = ()

@dataclass(frozen=True, slots=True)
class Document:
    blocks: tuple[Block, ...]
    metadata: Metadata = field(default_factory=Metadata)
```

`PageBreak` 的 Markdown 语法在 P1A 就要解析（便宜且 aim.md 已指定）：

- 单独一行 `<!-- pagebreak -->`
- 单独一块 `:::pagebreak` + `:::`（container，可用 markdown-it container 插件；若插件成本高，P1A 只实现 HTML comment，container 留 P1B）

**P1A 锁定 pagebreak：只实现 HTML comment。** `:::pagebreak` 在 P1B。

`Image` vs `InlineImage`：GFM 里独立一段只有一张图 → `Image` block；段落内 → `InlineImage`。Renderer：block image 单独成段居中可选，P1A 左对齐即可。

Visitor：

```python
class NodeVisitor:
    def visit(self, node): ...
    def generic_visit(self, node): ...
```

用 `functools.singledispatchmethod` 或 `visit_Heading` 命名约定。单测：数一棵树里 Heading 个数。

---

#### Task 1 — 依赖与版本

**文件：** `pyproject.toml`、`scripts/md_to_docx/__init__.py`、`CHANGELOG.md`、`tests/test_cli.py`

主依赖改为：

```toml
dependencies = [
  "markdown-it-py>=3.0",
  "mdit-py-plugins>=0.4",
  "python-docx>=1.0",
]
```

`dev` 仍含 `pytest` `lxml`。`python-docx` 可从 dev 去掉（已在主依赖）。

`requires-python` 保持 `>=3.10`。

版本 `0.2.0`。

`test_cli.py`：`assert "0.2.0" in result.stdout or ...` 改为从 `md_to_docx.__version__` 读取，避免下次再改测试。

验收：

```bash
pip install -e ".[dev]"
python -c "import markdown_it, docx; from md_to_docx import __version__; print(__version__)"
```

---

#### Task 2 — AST 节点 + visitor + 单测

**新建：** `scripts/md_to_docx/ast/nodes.py`、`visitor.py`、`__init__.py`

**新建测试：** `tests/test_ast.py`

测试必须覆盖：

1. 构造一棵含 Heading/Paragraph/List/Table/CodeBlock 的 Document，`==` 相等
2. frozen：`doc.blocks = ()` 应 raise
3. visitor 收集所有 `Text.value`
4. 非法 heading level：在 `__post_init__` 里 `Heading` 断言 `1 <= level <= 6`

不要在 AST 模块 import parser 或 renderer。

验收：`pytest tests/test_ast.py -v`

---

#### Task 3 — Frontmatter + Markdown parser

**新建：** `parse/frontmatter.py`、`parse/markdown.py`

##### 3.1 Frontmatter

识别文件开头：

```
---
title: X
author: Y
---
```

用标准库 `yaml` 会多一个依赖。P1A **不要加 PyYAML**。手写一个极小解析：只支持顶层 `key: value` 单行，值去引号。无法解析则 `extra` 忽略坏行并 warning 到 stderr，不要 crash。

返回 `(Metadata, remaining_markdown: str)`。无 frontmatter 则 Metadata 全 None，原文不动。

测试：`tests/test_parse_frontmatter.py`

##### 3.2 markdown-it-py 配置

```python
from markdown_it import MarkdownIt
from mdit_py_plugins.front_matter import front_matter_plugin  # 若与手写冲突，不用这个插件
from mdit_py_plugins.tasklists import tasklists_plugin
from mdit_py_plugins.strikethrough import strikethrough_plugin  # 若 GFM 已含则不要重复
```

实际以 `MarkdownIt("gfm-like")` 或 `MarkdownIt("commonmark").enable("table").enable("strikethrough")` 为准。实现时读 markdown-it-py 文档，**启用：table, strikethrough, linkify 不要启用（避免把代码里 URL 乱变链接）**。

`md.parse(src)` 得到 token 流，写 `tokens_to_document(tokens) -> Document`。

映射表（必须实现）：

| Token | AST |
|-------|-----|
| heading_open/close | Heading |
| paragraph_open/close | Paragraph |
| bullet_list / ordered_list | ListBlock |
| list_item | ListItem |
| fence | CodeBlock（info string → lang） |
| code_block | CodeBlock(lang=None) |
| blockquote | BlockQuote |
| table | Table + TableCell |
| hr | ThematicBreak |
| html_block 含 `<!-- pagebreak -->` | PageBreak |
| image（block） | Image |
| inline: text, strong, em, s, code_inline, link, image, hardbreak, softbreak | 对应 Inline |
| task list token | ListItem.checked |

未识别的 block：降级为 `Paragraph([Text(raw)])` 或 `HTMLBlock`，并在 `warnings` 列表返回。不要 silent drop。

##### 3.3 公共 API

```python
def parse_markdown(text: str, *, source_path: Path | None = None) -> Document:
    ...
```

`source_path` 仅用于解析相对图片路径（存 Metadata.extra 或让 Image.src 保持相对，renderer 用 source_path.parent 去找文件）。**Image.src 保持 Markdown 里的相对路径字符串，不要在 parser 里读文件。**

##### 3.4 测试 `tests/test_parse_markdown.py`

用字符串夹具，不断言 docx。至少：

- `# H1` → Heading(1)
- 段落 + **bold** + `code`
- 有序/无序/嵌套 list
- GFM table 3x2
- fenced python code
- blockquote
- `<!-- pagebreak -->`
- task list `- [x] a`
- 中文标题与段落
- 图片 `![alt](./x.png)`
- 空文档 → `Document(blocks=())`

验收：`pytest tests/test_parse_markdown.py tests/test_parse_frontmatter.py -v`

---

#### Task 4 — DOCX renderer（无 TOC、无页眉）

**新建：** `render/styles.py`、`render/docx_renderer.py`

##### 4.1 默认样式（`styles.py`）

从 `reference.py` 抄字体常量，不要 import `reference.py`（它依赖重建模板的副作用风格）：

```python
BODY_FONT_LATIN = "Calibri"
BODY_FONT_EAST_ASIA = "Microsoft YaHei"
MONO_FONT = "Consolas"
CODE_FILL = "F5F5F5"  # RGB hex
HEADING_SIZES_PT = {1: 22, 2: 18, 3: 16, 4: 14, 5: 12, 6: 12}
BODY_SIZE_PT = 11
CODE_SIZE_PT = 9
```

`configure_document_styles(doc: Document) -> None`：

- Normal：拉丁 Calibri，东亚 微软雅黑，11pt，行距 1.15
- Heading 1–6：加粗，对应字号，东亚雅黑
- 自定义段落样式 `MDCodeBlock`：Consolas 9pt，底纹 `F5F5F5`，段前段后 6pt
- 表格：全框线 `w:tblBorders` 单线 4pt 色 `BFBFBF`
- themeFontLang：en-US + zh-CN（复制 `reference.py` 的 `set_theme_font_lang`）

##### 4.2 Renderer API

```python
def render_docx(document: ast.Document, out_path: Path, *, base_dir: Path | None = None) -> None:
    ...
```

- `base_dir` 用于解析 `Image.src`
- 图片文件不存在：插入 alt 文本段落 `[missing image: ...]`，stderr warning，不要抛异常导致整篇失败
- `PageBreak`：`doc.add_page_break()`
- `CodeBlock`：按行 `add_paragraph`，样式 `MDCodeBlock`；**P1A 不做行号、不做语法高亮着色**
- `Table`：`doc.add_table(rows, cols)`；header 行 bold + 底纹 `E7E6E6`
- `ListBlock`：用 Word 列表（`paragraph.style = List Number / List Bullet`）。嵌套 list：通过 `paragraph._p.get_or_add_pPr()` 的 `ilvl` 设置层级（0–8）。参考 python-docx 列表操作；写一个 `_apply_list_level(paragraph, ordered: bool, level: int)` 辅助函数
- `Link`：`run.font.color` 蓝色 + underline；`r.hyperlink` 用 python-docx 的 `paragraph.add_run` + relationship。若实现成本高：P1A 允许写成蓝色下划线文本 + 括号 URL `text (https://...)`，但必须在 `render/docx_renderer.py` 顶部注释 `TODO P1B: native hyperlink relationship`。**优先真 hyperlink。** 参考：`docx.oxml` hyperlink 示例，搜 python-docx add hyperlink helper——很多项目复制同一 20 行函数，把它放进 `render/docx_renderer.py` 的 `_add_hyperlink`
- `Strike`：`run.font.strike = True`
- `BlockQuote`：左缩进 0.5 inch，字体色 `#595959`，可选左侧不做 bar（P1A 不做 OOXML border 也行）
- `ThematicBreak`：底边框段落
- Metadata.title：若存在，且文档第一个 block 不是 H1，则先插入 H1。若第一个已是 H1，不重复
- 中文：不要给每个 run 手动设 eastAsia，靠 style 的 rFonts eastAsia

超宽表：P1A 设 `tblW` type=pct 5000（100%）。单元格允许换行。合并单元格 **不做**（Markdown 也没有 colspan）。

##### 4.3 测试 `tests/test_native_docx.py`

模式对齐 `tests/test_docx_output.py`：zipfile + lxml xpath。

夹具：把 `tests/fixtures/sample.md` 和 `tests/fixtures/comprehensive.md` 用 native 引擎转换到 tmp。

断言：

- `[Content_Types].xml` 存在（合法 docx）
- 至少一个 `w:pStyle w:val="Heading1"` 或 Heading2（视夹具而定）
- 存在 `w:tbl`
- 代码段落使用 `MDCodeBlock` 或 Consolas `w:rFonts`
- 东亚字体 `w:eastAsia="Microsoft YaHei"` 出现在 styles 或 runs
- comprehensive 的中文「综合测试」出现在 `w:t`
- pagebreak 夹具：`w:br w:type="page"`

不要复制 pandoc 引擎对 Lua 特有样式名的断言。

验收：`pytest tests/test_native_docx.py -v`

---

#### Task 5 — Engine 门面 + CLI

##### 5.1 `engine/native.py`

```python
def convert_native(md_path: Path, out_docx: Path, *, normalize: bool = True) -> None:
    text = md_path.read_text(encoding="utf-8")
    if normalize:
        from md_to_docx.converter import normalize_md
        text = normalize_md(text)
    doc = parse_markdown(text, source_path=md_path)
    render_docx(doc, out_docx, base_dir=md_path.parent)
```

##### 5.2 `engine/pandoc.py`

把 `converter.convert_one` 原样调用。**不要复制 400 行。** `convert_one` 签名保持。

##### 5.3 `converter.py` 增加门面

```python
def convert_file(md_path: Path, out_docx: Path, *, engine: str = "native", **pandoc_kwargs) -> None:
    if engine == "native":
        convert_native(md_path, out_docx)
    elif engine == "pandoc":
        convert_one(...)  # 现有参数
    else:
        raise ValueError(...)
```

CLI 批量循环改走 `convert_file`。

##### 5.4 CLI flags

```
--engine {native,pandoc}   default native
--normalize / --no-normalize
```

env：`MD_TO_DOCX_ENGINE=pandoc` 在 flag 缺省时生效。flag 优先于 env。

`--help` 文案改成 document compiler，不要只写 WeCom。

##### 5.5 pandoc 引擎测试隔离

现有 `tests/test_docx_output.py`、`tests/test_cli.py` 里真正调用转换的测试：

- 明确走 `--engine pandoc` **或** 在测试里调用 `convert_one`（已经如此的保持）
- 新增 CLI 测试：默认引擎 native 转换 `sample.md` 成功
- `test_version_flag` 用 `__version__`

##### 5.6 无 pandoc 时 native 必须能跑

加测试 `tests/test_native_no_pandoc.py`：monkeypatch `shutil.which` 让 `pandoc` 不存在，调用 native convert，应成功。这是 native 引擎的关键价值。

验收：

```bash
pytest tests/ -v
python -m md_to_docx tests/fixtures/sample.md --output-dir /tmp/p1a --engine native
python -m md_to_docx tests/fixtures/sample.md --output-dir /tmp/p1a-p --engine pandoc
```

两条都产生 docx。

---

#### Task 6 — 文档与 examples

- `README.md` / `README.zh.md`：Quick Start 注明默认 native，无需 pandoc；Mermaid 仍需 mmdc **仅 pandoc 引擎**。诚实写：native 的 mermaid 本版本当代码块展示。
- `references/development.md`：画新管道图；说明双引擎
- `CONTRIBUTING.md`：新包结构
- `CHANGELOG.md`：`## [0.2.0]` Added AST/parser/native renderer；Changed default engine
- `examples/README.md`：去掉「only pandoc pipeline」过时句
- `SKILL.md`：默认命令仍 `bin/convert`；加一句 native 默认、企微如需旧排版用 `--engine pandoc`

`references/wecom-import.md`：第一句改为推荐 `--engine pandoc` 以保持现有企微 Lua 布局。

---

#### Task 7 — CI

`.github/workflows/ci.yml`：

- native 转换 examples **不安装 pandoc 的 job**（新 job `test-native`）：只 setup python，不 apt pandoc，跑 `pytest tests/test_ast.py tests/test_parse_markdown.py tests/test_native_docx.py tests/test_native_no_pandoc.py`
- 原 job 继续装 pandoc，跑全量（含 pandoc 引擎）

matrix 3.10–3.12 保持。

---

#### 架构禁区自检（合并前必跑）

```bash
### Parser/AST 不得依赖 python-docx
python3 - <<'PY'
from pathlib import Path
bad = []
for p in Path("scripts/md_to_docx/ast").rglob("*.py"):
    t = p.read_text()
    if "docx" in t or "OxmlElement" in t:
        bad.append(p)
for p in Path("scripts/md_to_docx/parse").rglob("*.py"):
    t = p.read_text()
    if "docx" in t or "OxmlElement" in t:
        bad.append(p)
print(bad)
raise SystemExit(1 if bad else 0)
PY
```

---

#### 明确不做（P1B+）

| 能力 | 去向 |
|------|------|
| `--template` / style definition 文件 | P1B |
| Word 原生 TOC field | P1B |
| Header/Footer/页码 | P1B |
| `:::pagebreak` container | P1B |
| Mermaid → SVG | P1C |
| Math OMML | P1C |
| Caption / Cross-ref | P1C |
| `--preset` | P1D |
| 语法高亮 / 代码行号 | P1C 或更后，不要在 P1A 做 |

---

#### Handoff to P1B

P1B 将在 AST 上加 Transformer（编号、TOC 收集）和 Template（从 docx 参考文档读样式，而不是 if 模板名）。不要在 P1A 把样式硬编码成「technical vs academic」分支——只允许一套 DefaultTheme 常量。

---

#### Execution log

**2026-09-02** — P1A done. v0.2.0→1.0.0 shipped in combined session. AST/parser/native renderer; pytest 92 passed.

---

## P1B — template / TOC / CJK

<!-- source: P1B-template-toc-cjk.md -->

### P1B — Template、TOC、页眉页脚、CJK（v0.3.0）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1A `DONE`（native AST 管道已是默认引擎）
> **Depends on:** P1A
> **Unblocks:** P1C
> **Target version:** `0.3.0`

---

#### Execution contract

##### Goal

让 native 引擎产出「像正式文档」的 Word：用户可提供参考模板 docx；能插入 Word 原生 TOC；有页眉页脚页码；CJK 混排、表格、分页在 Word 里不崩。

##### 禁止

- `if template == "technical":` / `if preset == "academic":`（Preset 是 P1D）
- 在 Parser 里碰 python-docx
- 实现 OMML、Caption 自动编号、Mermaid SVG（P1C）
- 插件系统 / Marketplace
- 为 100 种 Markdown 方言扩展 parser

##### Done when

- [ ] `md-to-docx report.md --template path/to.docx` 使用该文件的 styles + header/footer 作为基底
- [ ] `--toc` 写入 Word 原生 TOC field（不是静态纯文本目录）
- [ ] 默认页脚含页码；`--title` / `--author` 可进页眉
- [ ] `:::pagebreak` 与 `<!-- pagebreak -->` 都变成 `PageBreak`
- [ ] CJK 夹具（中英、中文+代码、中文表）XML 断言 + 人工检查清单
- [ ] pytest 全绿；pandoc 引擎不被破坏

---

#### 锁定决策

1. **Template = 一份 .docx 参考文档，不是 Python if。** 实现：复制模板 ZIP 为输出起点，或 `Document(template_path)` 然后清空 body 再按 AST 渲染进同一 Document（保留 styles.xml、header、footer、theme）。
2. **无 `--template` 时：** 使用内置 `assets/reference-native.docx`（本阶段新建，由脚本生成，类似现在的 `reference-wecom.docx`，但服务 native 引擎）。
3. **不要复用 `reference-wecom.docx` 当 native 默认模板**（它为 pandoc 样式名服务）。WeCom 继续走 `--engine pandoc`。
4. **TOC：** OOXML `w:fldChar` + `instrText` = `TOC \o "1-3" \h \z \u`。打开 Word 时可能要「更新域」。在 README 写明。额外生成一个静态目录段落作为 fallback **不要做**——只做原生域。
5. **页码：** 页脚 `PAGE` field。
6. **`--title` `--author` `--date`：** CLI 覆盖 frontmatter；写入 metadata 并进页眉（左 title，右 date 或 author）。
7. **编号标题：** `--numbering` 给 Heading 加 `1 / 1.1 / 1.1.1` 前缀文本（真 Word 多级列表映射可做，但 P1B 先做可见前缀 + outline level）。P1D 再考虑 `w:numPr` 多级列表。

---

#### 目标新增文件

```
scripts/md_to_docx/transform/__init__.py
scripts/md_to_docx/transform/numbering.py
scripts/md_to_docx/transform/outline.py
scripts/md_to_docx/render/template.py
scripts/md_to_docx/render/fields.py      # TOC / PAGE / hyperlink helpers
scripts/md_to_docx/render/header_footer.py
scripts/md_to_docx/reference_native.py   # 生成 assets/reference-native.docx
assets/reference-native.docx
assets/templates/README.md               # 说明如何做自己的模板
tests/fixtures/cjk.md
tests/fixtures/pagebreak.md
tests/test_template.py
tests/test_toc.py
tests/test_header_footer.py
tests/test_cjk.py
tests/test_parse_containers.py
```

---

#### Task 1 — 解析 `:::pagebreak`

**文件：** `parse/markdown.py`

启用 `mdit_py_plugins.container` 或手写 preprocess：

preprocess 更简单且不引入复杂插件：在 `parse_markdown` 开头，把独立成段的

```
:::pagebreak
:::
```

以及 `::: pagebreak` 变体替换为 `<!-- pagebreak -->`，再走现有 HTML comment 逻辑。

也接受 `:::pagebreak :::` 单行。

测试：`tests/test_parse_containers.py`

不要在 P1B 实现 `:::warning` / `:::figure`（那是 P4 Document Standard）。

---

#### Task 2 — 内置 native 参考模板

**新建：** `scripts/md_to_docx/reference_native.py`

用 python-docx 从空白文档配置：

- 页边距 1 inch（或 2.54cm）
- Normal / Heading1–6 / MDCodeBlock（与 P1A styles.py 一致）
- 页脚居中 PAGE 域
- 页眉空（由 CLI 填充）
- 页眉页脚不同 first page：**关闭**（P1B 简单）
- 东亚字体 微软雅黑，西文 Calibri，等宽 Consolas
- A4：`section.page_width = Mm(210)` `page_height = Mm(297)`

生成到 `assets/reference-native.docx`。

`pyproject.toml` hatch `force-include` 加上这个文件，和 wecom 参考一样打进 wheel。

`paths.py`：`native_reference_doc()` 与现有 `bundled_path` 对称。

CLI：`python -m md_to_docx.reference_native` 重建。`references/development.md` 写命令。

**不要**在运行时每次重建；提交二进制 `assets/reference-native.docx`。

验收：脚本可重复生成；文件 > 5KB。

---

#### Task 3 — Template 加载器

**新建：** `render/template.py`

```python
def open_document(template_path: Path | None) -> Document:
    path = template_path or bundled_native_reference()
    doc = Document(str(path))
    clear_body(doc)
    return doc
```

`clear_body`：删除 `document.body` 里除 `sectPr` 以外的子元素。必须保留 sectPr（页边距、页眉页脚引用）。实现时用 oxml，写单测：模板带 1 个段落 + header，clear 后段落没了，`doc.sections[0].header` 仍可访问。

Renderer 改为：`render_docx(..., template_path=None)` 内部 `open_document`，不再 `Document()` 空白。

把 P1A `configure_document_styles` 改成：

- 若模板已有 Heading 1 / Normal：不覆盖字号/字体（尊重模板）
- 若缺 `MDCodeBlock`：才添加
- `--force-default-styles` flag 可选，P1B 可以不做，缺省尊重模板

锁定：**尊重模板 styles 是默认。** 内置模板已经含我们的 styles，所以默认路径观感不变。

CLI：

```
--template PATH
```

相对路径相对 cwd。不存在则 stderr `error: template not found: ...` 退出码 2。

测试 `tests/test_template.py`：造一个临时 docx，改 Heading1 为红色 28pt，转换 `# Hello`，断言输出 styles 或 run 里出现该字号/颜色。

---

#### Task 4 — TOC 原生域

**新建：** `render/fields.py`

辅助函数：

```python
def add_toc_field(paragraph) -> None:
    # w:r + fldChar begin, instrText 'TOC \o "1-3" \h \z \u', fldChar separate, placeholder text, fldChar end
```

Transformer `transform/outline.py`：若 `toc=True`，在 **第一个 Heading 之前** 插入一个伪节点。

**不要把 TOC 做成 AST 节点也可以**，更干净的是 AST 增加：

```python
@dataclass(frozen=True, slots=True)
class TableOfContents:
    levels: int = 3
```

加进 `Block` Union。Parser 不生产它。`engine/native.py` 在 parse 后：

```python
if toc:
    doc = insert_toc(doc, levels=3)
```

`insert_toc` 放 `transform/outline.py`，返回新 Document（frozen AST，用替换 blocks 元组）。

Renderer 遇到 `TableOfContents`：加 Heading「Contents」或中文「目录」（`--toc-title`，默认 `Contents`；若 metadata/lang 以后再做。P1B：`--toc-title` 默认 `Contents`）。然后 `add_toc_field`。

CLI：`--toc` / `--no-toc`。frontmatter `toc: true` 也开启（frontmatter 解析在 P1A 是弱 YAML：给 `toc` 支持 `true/false/yes/no/1/0`）。

测试 `tests/test_toc.py`：

- 转换含 H1/H2 的 md + `--toc`
- unzip `word/document.xml` 断言 `TOC` 出现在 `w:instrText`
- 无 `--toc` 则无该 instrText

README 说明：用 Word 打开后若目录空白，右键域 → 更新。这是 Word 行为，不要用 LibreOffice 硬要求 TOC 已展开。

---

#### Task 5 — 页眉 / 页脚 / 页码 / 文档变量

**新建：** `render/header_footer.py`

```python
def apply_header_footer(
    doc: Document,
    *,
    title: str | None,
    author: str | None,
    date: str | None,
    version: str | None,
    page_numbers: bool = True,
) -> None:
```

规则：

- 页眉：左侧 `title or ""`，右侧 `author` 或 `date`（有 author 显示 author，date 放页脚左）
- 页脚：左 `version`（可空），中 `PAGE`，右空
- `--no-page-numbers` 去掉 PAGE
- 若模板已有页眉内容且用户没传 title/author：**保留模板页眉**
- 若用户传了 title：覆盖页眉

CLI：

```
--title
--author
--date
--doc-version          # 不要叫 --version（已是程序版本）
--no-page-numbers
```

frontmatter 键：`title` `author` `date` `version`（文档版本，映射到 `--doc-version`）。

测试 `tests/test_header_footer.py`：读 `word/header1.xml` 或 `header2.xml`（以实际关系文件为准，测试里扫描 zip 内 `word/header*.xml`）包含 title 字符串；`word/footer*.xml` 含 `PAGE`。

---

#### Task 6 — 标题编号 Transformer

**新建：** `transform/numbering.py`

```python
def apply_heading_numbers(doc: Document, *, enabled: bool) -> Document:
```

只改 `Heading.children`，在原 inlines 前插入 `Text("1.1 ")`（注意空格）。层级计数数组 length 6。

CLI `--numbering`。默认 off。

测试：AST 级单测即可（不必 XML）。`# A` `## B` `## C` `# D` → `1 A` / `1.1 B` / `1.2 C` / `2 D`。

---

#### Task 7 — CJK 质量

**新建夹具** `tests/fixtures/cjk.md`，必须含：

- 纯中文标题与段落
- 中英混排同一段落
- 中文 + Python 代码块（注释中文）
- 中文宽表（8 列短中文）
- 中文有序「1. 2.」与 Markdown 列表

**新建** `tests/test_cjk.py`：

- 所有中文句子出现在 `w:t`（按句抽取）
- `styles.xml` 或 runs 含 `w:eastAsia="Microsoft YaHei"`
- 表格存在
- 代码样式仍是等宽拉丁字体（Consolas），不要把代码块设成雅黑

`references/development.md` 增加 **CJK 人工验收**（agent 做不到真 Word 打开时，把清单写下，CI 只保证 XML）：

1. Word / WPS 打开不报修复
2. 中文标题不出现方框
3. 表不错列到页外完全不可读（宽表可换行）
4. 代码块中文注释可见

agent：用 `file`/`zipinfo` 确认 docx；XML 断言必须过。

---

#### Task 8 — Engine / CLI 接线与版本

`engine/native.py` 管道：

```
read → normalize? → parse → apply_heading_numbers? → insert_toc? → render_docx(template, header/footer)
```

版本 `0.3.0`。CHANGELOG、README flags 表、SKILL.md 增加 `--template --toc --title`。

`./bin/convert` 透传 argv，无需改。

帮助文本给错误示例：

```
error: template not found: ./missing.docx
hint: pass a .docx whose styles/header/footer you want to reuse
```

---

#### 验收命令

```bash
pip install -e ".[dev]"
pytest tests/ -v
python -m md_to_docx tests/fixtures/comprehensive.md --toc --numbering --title "CJK Test" --output-dir /tmp/p1b
python -m md_to_docx tests/fixtures/cjk.md --template assets/reference-native.docx --output-dir /tmp/p1b
python -m md_to_docx tests/fixtures/sample.md --engine pandoc --output-dir /tmp/p1b-pandoc
```

自检 AST 仍无 docx import。

---

#### Handoff to P1C

样式与域已经稳定。P1C 只加节点类型（Mermaid、Math、Figure/Caption、XRef）和对应 renderer，不要再改模板加载器结构。

---

#### Execution log

**2026-09-02** — P1B done as part of v1.0.0 release. Templates, TOC, CJK tests.

---

## P1C — Mermaid / math / captions

<!-- source: P1C-mermaid-math-caption.md -->

### P1C — Mermaid、Math（OMML）、Caption、交叉引用（v0.4.0）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1B `DONE`
> **Depends on:** P1B
> **Unblocks:** P1D
> **Target version:** `0.4.0`

---

#### Execution contract

##### Goal

做出与「又一个 pandoc 套壳」拉开差距的能力：Mermaid 进 Word（优先 SVG）、数学公式进 Word 原生 OMML、图/表题注、交叉引用。

##### 禁止

- 公式只截图当唯一路径（OMML 失败才允许降级 PNG）
- Mermaid 只走 PNG 且写死 mmdc 为唯一实现（PNG 仅作 fallback）
- Preset 名（P1D）
- Plugin API 抽象（P3B）。本阶段把 Mermaid/Math 做成 **内置 transformer**，函数签名要干净，方便以后抽插件，但不要搞 SPI
- 支持 aim.md 列出的每一种 mermaid 图失败就无限调参。覆盖清单见 Task 1，列外的降级为代码块 + warning

##### Done when

- [ ] ` ```mermaid ` 在 native 引擎变成图，优先 SVG
- [ ] `$$...$$` 与 `$...$` 变成 OMML（至少加减乘除、分数、上下标、希腊字母）
- [ ] 独立图片可生成 `Figure N. caption` 并带 bookmark
- [ ] `[fig:id]` 或 `[@fig:id]` 解析为可点击交叉引用（至少变成带 bookmark 的超链接文本 `Figure N`）
- [ ] 无 mermaid-cli 时：行为明确（error 或 skip 策略见锁定决策），不 traceback
- [ ] pytest 覆盖上述；pandoc 引擎回归绿

---

#### 锁定决策

1. **Mermaid 渲染顺序：** `mmdc --outputFormat svg` → 得到 SVG → 嵌入 DOCX。若 mmdc 失败或缺失：若存在 `MD_TO_DOCX_MERMAID_PNG=1` 再试 PNG；否则把节点当 `CodeBlock(lang=mermaid)` 并 **stderr warning**，退出码仍 0（单文件不因一张图失败）。CLI `--strict-mermaid` 时缺失 mmdc 则 exit 1。
2. **不要引入独立 Chromium 发行。** 继续用系统 Chrome / `PUPPETEER_EXECUTABLE_PATH` / `MD_TO_DOCX_BROWSER`（已有 `converter.py` 逻辑）。把浏览器发现函数从 `converter.py` 抽到 `md_to_docx/util/browser.py`，pandoc 与 native 共用。
3. **SVG 嵌入：** Word 对 SVG 支持看版本。实现两步：尝试 `word/media/*.svg` + `asvg` content type；若测试环境难以验证，**同时**用 `cairosvg` 或 `Pillow`？cairosvg 依赖 cairo，太重。
   - **锁定：** 优先把 SVG 转成 EMF 不现实。P1C 使用 **PNG 作为 Word 兼容嵌入**，但渲染源是 SVG（mmdc 出 SVG 再 `mmdc` 也可直接出 PNG）。
   - aim.md 写「最好优先 SVG」。执行折中：**mmdc 输出 SVG 存档在 `{stem}mermaid/` 旁路文件，docx 内嵌 PNG（高 scale）** 以保证 Word/WPS/企微都能打开。在 CHANGELOG 写：`source SVG saved next to output; embedded raster for compatibility`。
   - 目录：native 引擎用 `{stem}-media/` 而不是 `{stem}mermaid图片/`（旧目录仅 pandoc 引擎保留，避免破坏现有用户）。
4. **Math：** 依赖 `latex2mathml` + 自写 MathML→OMML，或 `latex2omml` 若有可靠库。锁定实现路径：
   - 加依赖 `latex2mathml>=3.0`
   - 新建 `render/omml.py`：MathML XML → OOXML `m:oMath`（映射 mfrac/msup/msub/mi/mo/mn/msqrt/mrow）
   - 覆盖不了的 LaTeX：降级为等宽文本 `E = mc^2` + warning
5. **Caption：** 独立 `Image` block 若 alt 或 title 非空，渲染为 Figure。计数器全局递增。bookmark 名 `fig-N` 或用户 `{#fig:arch}`。
6. **图片 id 语法（锁定一种，不要三种都做）：**
   ```markdown
   ![系统架构](architecture.png){#fig:arch}
   ```
   Parser 从 alt/title 后的 `{#fig:arch}` 读 id。无 id 则自动 `fig-1`。
7. **交叉引用语法（锁定）：** `[@fig:arch]` → 「Figure 1」。中文文档 `--figure-label 图` 则渲染「图 1」。表格 `{#tbl:x}` / `[@tbl:x]` 同样。Heading 自动 slug，`[@sec:slug]` P1C 做 Section 引用。
8. **Footnote：** aim.md P1 列了 Footnote。P1C **要做基础脚注**：`[^1]` / `[^1]: text`。Renderer 用 Word `w:footnote`。这是专业文档刚需，工作量可控。

---

#### AST 扩展（`ast/nodes.py`）

新增（frozen dataclasses）：

```python
@dataclass(frozen=True, slots=True)
class Mermaid:
    source: str
    diagram_hint: str | None = None  # flowchart / sequence / ...

@dataclass(frozen=True, slots=True)
class MathBlock:
    latex: str

@dataclass(frozen=True, slots=True)
class MathInline:  # 加入 Inline union
    latex: str

@dataclass(frozen=True, slots=True)
class Figure:
    image: Image | Mermaid
    caption: str
    identifier: str  # fig:arch
    number: int | None = None  # transformer 填写

@dataclass(frozen=True, slots=True)
class CrossRef:
    kind: Literal["fig", "tbl", "sec"]
    identifier: str  # 不含 kind 前缀或含，解析时规范化成 "fig:arch"

@dataclass(frozen=True, slots=True)
class FootnoteRef:  # Inline
    key: str

@dataclass(frozen=True, slots=True)
class FootnoteDef:  # 可放 Document.footnotes
    key: str
    children: tuple[Block, ...]
```

`Document` 增加 `footnotes: tuple[FootnoteDef, ...] = ()`。

`CodeBlock(lang="mermaid")` 在 transformer `transform/mermaid.py` 里升级为 `Mermaid`。Parser 也可以直接认 fence mermaid。锁定：**parser 直接产出 Mermaid 节点**，少一轮。

Table 增加可选 `identifier: str | None`。语法：表后一行 `{: #tbl:foo}` 太怪。锁定表格 caption：

```markdown
Table: API endpoints {#tbl:api}

| A | B |
```

若 markdown-it 难做，preprocess 识别 `Table: ... {#id}` 紧挨表格上方。

---

#### Task 1 — Mermaid

**新建：** `scripts/md_to_docx/transform/mermaid.py`、`scripts/md_to_docx/render/image.py`

抽 `converter.py` 的 mmdc 调用为 `util/mmdc.py`：

```python
def render_mermaid_to_files(source: str, out_svg: Path, *, png: Path | None, scale: float, browser: str | None) -> None:
```

支持图表（mmdc 能渲染即可，测试夹具各一份最小源）：

- flowchart
- sequenceDiagram
- classDiagram
- stateDiagram-v2
- erDiagram
- gantt（最小）
- mindmap（若 mmdc 版本失败：标 xfail 并降级代码块，不要卡死整个 plan）

CLI 复用 env：`MD_TO_DOCX_MERMAID_SCALE`（已有）。

测试：

- `tests/test_parse_mermaid.py`：fence → Mermaid 节点
- `tests/test_render_mermaid.py`：有 mmdc skip-if-missing 的集成测试，docx zip 内 `word/media/` 至少 1 个 png
- 无 mmdc：warning 路径单测（mock）

CI：ubuntu job **不要** 默认装 mermaid-cli（慢）。集成测试 `@pytest.mark.mermaid`，CI 不加这 mark 到默认 pytest。文档写：`pytest -m mermaid` 本地跑。`pytest.ini` 配置：

```toml
markers = mermaid: needs mmdc
```

默认 `addopts` 不要排除，用 `pytestmark skipif not shutil.which("mmdc")`。

---

#### Task 2 — Math OMML

**新建：** `parse` 启用 `mdit_py_plugins.dollarmath`（或等价）。

**新建：** `render/omml.py` + `tests/test_omml.py`

最小 LaTeX 矩阵（必须过）：

| 输入 | 期望 |
|------|------|
| `$E=mc^2$` | inline oMath，含 sup |
| `$$\frac{a}{b}$$` | block oMath，m:f 分数 |
| `$\alpha + \beta$` | 希腊字母 |
| `$\sqrt{x}$` | radical |
| `$\sum_{i=1}^n i$` | 允许降级，能过最好 |

docx XML 命名空间：

`xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"`

断言存在 `m:oMath`。

失败路径：`$$$broken` 不要崩，当 Text。

---

#### Task 3 — Caption + Bookmark + CrossRef

**新建：** `transform/captions.py`、`transform/xrefs.py`

流程：

1. parse
2. `assign_caption_numbers(doc)` 遍历 Figure/Table 填 number
3. `resolve_xrefs(doc)` 把 `CrossRef` 换成 `Link` 指向 `#_bookmark` 或保留 CrossRef 让 renderer 处理
4. render：Figure 下加段落样式 `Caption`（模板没有就创建），文本 `{label} {n}. {caption}`，bookmark 包住编号

Parser 扩展：

- 图片 `{#fig:id}`
- inline `[@fig:id]` `[@tbl:id]` `[@sec:id]`
- Heading 自动 slug：小写、空格变 `-`、保留中文（不要 strip 中文）

测试 `tests/test_captions.py` `tests/test_xrefs.py`：

- 两张图编号 1、2
- `[@fig:arch]` 文本含 `Figure 1` 或 `图 1`
- document.xml 含 `w:bookmarkStart`

`--figure-label` 默认 `Figure`，`--table-label` 默认 `Table`，`--section-label` 默认 `Section`。

中文例子 `chinese-report` 可在 P1D 再改标签；P1C 加 CLI 即可。

---

#### Task 4 — Footnotes

Parser：markdown-it footnotes 插件 `mdit_py_plugins.footnote`。

Renderer：python-docx 对 footnotes 支持弱，需 oxml 操作 `word/footnotes.xml` part。参考现有开源 snippet，放 `render/footnotes.py`。

测试：`[^a]` 定义存在时，docx 里 `word/footnotes.xml` 含注释文本。无定义的 ref：原样文本 `[^a]` + warning。

---

#### Task 5 — CLI / 文档 / 版本

版本 `0.4.0`。

README Features 更新：Mermaid、Math、Captions、Cross-refs、Footnotes。诚实写 OMML 覆盖范围与 Word 需较新版本。

CHANGELOG。`examples/technical-report/example.md` **现在**可以加 mermaid fence（P0 故意没加）。更新该例子，README 写需要 mmdc。

SKILL.md：转换含 mermaid 时检查 mmdc；公式不要截图。

---

#### 验收命令

```bash
pip install -e ".[dev]"
pytest tests/ -v
python -m md_to_docx tests/fixtures/sample.md --output-dir /tmp/p1c
### 含公式/图的新夹具
python -m md_to_docx tests/fixtures/math.md --output-dir /tmp/p1c
python -m md_to_docx tests/fixtures/captions.md --output-dir /tmp/p1c
```

新建夹具 `tests/fixtures/math.md`、`captions.md`、`footnotes.md`。

Parser/AST 仍禁止 import docx。MathML 转换在 `render/`。

---

#### Handoff to P1D

差异化能力已在引擎内。P1D 做 preset 打包、质量闸门、v1.0 发布，不再加新语法。

---

#### Execution log

**2026-09-02** — P1C done. Mermaid, OMML math, captions, footnotes in v1.0.0.

---

## P1D — v1 release

<!-- source: P1D-v1-release.md -->

### P1D — v1.0 Professional Markdown → DOCX

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1C `DONE`
> **Depends on:** P1C
> **Unblocks:** P2A, P2B
> **Target version:** `1.0.0`

---

#### Execution contract

##### Goal

把引擎收成一个技术用户愿意每天用的 v1.0：Preset、专业模板、文档校验、回归黄金件、发 GitHub Release。第一座山完成：**DOCX 质量明显好于自己手搓 pandoc / python-docx。**

##### 禁止

- Web Playground、MCP、浏览器插件、VS Code（P2/P3）
- 新 Markdown 语法
- 把核心闭源
- 强行占用别人的 PyPI 名 `md-to-docx` 去 upload（会失败或侵权）
- 删除 pandoc 引擎（可标 deprecated，v1.0 仍要能跑 WeCom 路径）

##### Done when

- [ ] `--preset professional|technical|academic|business|report|wecom` 可用
- [ ] wecom preset = 现有 pandoc 引擎 + reference-wecom（行为兼容）
- [ ] 其余 preset = native 引擎 + 内置模板 docx
- [ ] `md-to-docx --check file.md` 校验但不写 docx
- [ ] examples 全部用 v1 引擎重生并提交
- [ ] GitHub Release `v1.0.0` 的 workflow 仍可用（P0 已加）
- [ ] 测试含 preset / validate；版本号 1.0.0

---

#### 锁定决策

1. **Preset 是「选中一份内置模板 + 一组默认 flag」，不是 if 森林。** 实现为数据：

```python
PRESETS: dict[str, Preset] = {
  "professional": Preset(template="professional.docx", engine="native", toc=True, numbering=False, figure_label="Figure"),
  "technical": Preset(template="technical.docx", engine="native", toc=True, numbering=True),
  "academic": Preset(template="academic.docx", engine="native", toc=True, numbering=True),
  "business": Preset(template="business.docx", engine="native", toc=False),
  "report": Preset(template="report.docx", engine="native", toc=True),
  "wecom": Preset(template=None, engine="pandoc", toc=False),
}
```

CLI 显式 flag 覆盖 preset（`--no-toc` 覆盖 technical 的 toc=True）。

2. **内置模板文件：**

```
assets/presets/professional.docx
assets/presets/technical.docx
assets/presets/academic.docx
assets/presets/business.docx
assets/presets/report.docx
```

用 `reference_native.py` 参数化生成（字体/标题色/页眉默认文案不同），**禁止**五份复制粘贴的生成脚本。一个 `scripts/md_to_docx/presets.py` + 数据表。

差异要肉眼可辨：

| preset | 标题色 | 正文字号 | 页眉 |
|--------|--------|----------|------|
| professional | #111827 | 11 | 空，页码 |
| technical | #1E3A5F | 10.5 | 文档 title |
| academic | #000000 | 12 宋体/Times | 论文题名 |
| business | #1F4E79 | 11 | 公司/title |
| report | #0F172A | 11 | Report / date |

CJK：academic 东亚用宋体 `SimSun`，其余微软雅黑。西文 academic 用 Times New Roman，其余 Calibri。

3. **PyPI 名：** 调查后锁定发布名 **`md2docx-compiler`**（若占用则 `ai-md-to-docx`）。GitHub 仓库名永远 `md-to-docx`。`pyproject.toml` 的 `name` 改成选定的未占用名，console script **保持** `md-to-docx`。

   执行 Task 0：用 `curl -sI https://pypi.org/pypi/md2docx-compiler/json` 检查 404 再写进本文件 Execution log。若占用，试 `md-to-docx-compiler`。**不要**用 `md-to-docx`。

4. **`--check`（Document Validation）：** 解析 + 规则，不渲染。规则：
   - 断链图片
   - 未定义的 `[@fig:]` / footnote
   - heading 从 H1 跳到 H4
   - 空文档
   退出码 1（有 error）/ 0（仅 warning 或干净）。`--check --strict` 时 warning 也变 error。

5. **pandoc 引擎：** `--engine pandoc` 与 `--preset wecom` 保留。README 把 wecom 当场景。Deprecation warning **不要在 1.0 喊**，2.0 再说。

6. **黄金回归：** `tests/goldens/` 存 **XML 规范化后的哈希或关键 xpath 快照**，不要存整份 docx 二进制对比（易碎）。对 `examples/*/example.md` 跑 native+professional，断言 heading 数、table 数、存在 styles。

---

#### Task 0 — PyPI 名确认

```bash
for n in md2docx-compiler md-to-docx-compiler ai-md-to-docx; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://pypi.org/pypi/${n}/json")
  echo "$n $code"
done
```

404 = 可用。把选中的名字写入 `pyproject.toml` `[project].name`，并在 README Install 写：

```
pip install md2docx-compiler
md-to-docx report.md
```

**1.0 可以暂不 `twine upload`。** 有 GitHub Release 资产即可。Upload 仅当用户明确说「发布到 PyPI」。

---

#### Task 1 — Preset 数据与生成器

实现 `scripts/md_to_docx/preset.py`：

```python
@dataclass(frozen=True)
class Preset:
    name: str
    template: str | None
    engine: str
    toc: bool
    numbering: bool
    figure_label: str
    table_label: str
    toc_title: str
```

`load_preset(name) -> Preset` 未知名：

```
error: unknown preset 'foo'
hint: professional, technical, academic, business, report, wecom
```

生成脚本 `python -m md_to_docx.presets_build` 写 5 个 docx。提交二进制。hatch force-include `assets/presets/*.docx`。

---

#### Task 2 — CLI 合并 preset 与 flag

解析顺序锁定：

1. 默认 professional 吗？**否。** 默认 = native + `reference-native.docx`，无 toc。避免「没要目录却插 TOC」。
2. `--preset X` 应用 Preset 默认
3. 再应用显式 `--toc` `--template` `--engine` 等覆盖

`--preset wecom` 强制 engine=pandoc，忽略 `--template`（warning）。

`tests/test_preset.py`：mock 或真实短 md。

帮助里 Examples：

```
md-to-docx report.md --preset technical
md-to-docx report.md --preset wecom
```

---

#### Task 3 — `--check` 校验器

**新建：** `scripts/md_to_docx/validate.py`

```python
@dataclass
class Issue:
    severity: Literal["error", "warning"]
    code: str
    message: str
    line: int | None = None

def validate_document(doc: Document, *, base_dir: Path) -> list[Issue]:
```

codes 锁定：`empty_document` `heading_skip` `missing_image` `unresolved_xref` `unresolved_footnote` `missing_mermaid_cli`（warning）

CLI `--check` 打印：

```
examples/foo.md:12: error: missing_image: ./nope.png
summary: 1 error, 2 warnings
```

机器可读：`--check --format json` 输出 Issue 列表。

测试 `tests/test_validate.py`。

---

#### Task 4 — 质量闸门与 examples 重生

```bash
python -m md_to_docx --preset technical examples/technical-report/example.md
### 每个 examples/* 指定合适 preset（chinese-report → professional + --figure-label 图 --toc-title 目录）
```

更新 `scripts/demo/build_examples.sh` 使用 preset。提交新 docx。

`tests/test_examples_smoke.py`：对每个 example.md native 转换成功、docx > 2KB、含 `w:document`。

把 P0 占位 preview.png 留着，不强制真 Word 截图。README 可注明 screenshots are illustrative。

---

#### Task 5 — 文档、Skill、版本、Changelog

- 版本 `1.0.0`，Development Status classifier 改为 `5 - Production/Stable`
- README 第一屏 CTA 增加典型命令 `--preset technical`
- 新文档 `references/presets.md`、`references/validation.md`
- SKILL.md：Agent 默认 `--preset technical` 当用户说「正式技术方案」；企微导入用 `--preset wecom`
- CONTRIBUTING：preset 模板如何重建
- CHANGELOG：`## [1.0.0]` 汇总 0.2–0.4 用户能感知的能力（即使那些版本没单独打 tag，1.0 notes 也要完整）

---

#### Task 6 — 发布检查单（代码做完，tag 等用户）

Agent 准备好，**不要擅自 git tag / push / gh release**，除非用户要求。

检查单写入 `references/release.md`：

1. pytest 全绿
2. examples 已重建
3. CHANGELOG 1.0.0 日期
4. 用户执行：`git tag v1.0.0 && git push origin v1.0.0` → P0 的 release.yml 跑

---

#### 验收命令

```bash
pip install -e ".[dev]"
pytest tests/ -v
python -m md_to_docx --help | grep -E "preset|check"
python -m md_to_docx --check tests/fixtures/comprehensive.md
python -m md_to_docx tests/fixtures/comprehensive.md --preset technical --output-dir /tmp/p1d
python -m md_to_docx tests/fixtures/sample.md --preset wecom --output-dir /tmp/p1d-wecom
```

wecom 路径需要 pandoc。

---

#### 第一座山完成标准（写进 README Status）

```
Status: 1.0 — Professional Markdown → DOCX
Default engine: native Document AST
WeCom import: --preset wecom
```

---

#### Handoff

下一座山是 AI 入口（P2A Skill/MCP）和 30 秒体验（P2B Web）。引擎不要在 P2 再拆。P2 只包一层。

---

#### Execution log

**2026-09-02** — P1D done. v1.0.0, presets, --check, md2docx-compiler package name. PyPI upload not performed.

---

## P2A — agent / MCP

<!-- source: P2A-agent-mcp.md -->

### P2A — Agent Skill 矩阵 + MCP（v2.0 引擎侧）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1D `DONE`（v1.0 引擎稳定）
> **Depends on:** P1D
> **Unblocks:** P2C（扩展要调引擎/MCP）、P3A
> **Target version:** 引擎仍 1.x 或 bump `2.0.0` 仅当有破坏性 CLI 变化。锁定：**本 plan 不破坏 v1 CLI。** MCP 与多 Skill 是加法。版本号：`pyproject.toml` 保持 1.x，除非用户要求 2.0.0。产品里程碑叫 v2.0。

---

#### Execution contract

##### Goal

任何 AI（ChatGPT / Claude / Gemini / DeepSeek / Cursor / Codex）写出 Markdown 之后，Agent 能一句「转成正式 Word」调 md-to-docx，选 preset，产出 DOCX。MCP 提供同样能力给支持 MCP 的客户端。

##### 禁止

- 核心引擎调用 OpenAI/Anthropic API
- 把 Markdown 送到云端再转换（本 plan 全部本地）
- 重写 AST
- 做浏览器插件（P2C）或 Web UI（P2B）
- 「智能改写第三章」——那是 P4 AI Document Editing

##### Done when

- [ ] Cursor Skill 仍可用，且描述变成 AI → professional DOCX
- [ ] 增加 Claude Code / Codex 可用的 skill 文件（同一仓库，路径见下）
- [ ] `md-to-docx-mcp` 以 **本仓库内包** 提供（暂不拆独立 git repo）
- [ ] MCP tools：`convert_markdown` `apply_template` `validate_document` `list_presets`
- [ ] 工具描述写清：输入是 Markdown 路径或内容，输出是本地 docx 路径
- [ ] 无 API key 环境变量出现在引擎或 MCP 代码里

---

#### 锁定决策

1. **AI 只是入口。** MCP/Skill 只调用 `md_to_docx.engine` 的 Python API 或 subprocess CLI。不要复制转换逻辑。
2. **先不拆 GitHub org 多仓库。** aim.md 的 `md-to-docx-mcp` 目录先放：

```
mcp/
  README.md
  pyproject.toml          # 可选：若用同一 monorepo extra 则省略
  server.py
```

或包内 `scripts/md_to_docx/mcp_server.py`。锁定：**`scripts/md_to_docx/mcp/server.py` + extra `[mcp]`**。用户 `pip install .[mcp]`。

3. **MCP 依赖：** `mcp>=1.0`（官方 Python SDK）。stdio transport。
4. **Skill 矩阵：** 不写 6 份重复 SKILL。一份 `SKILL.md` + `skills/` 薄包装：

```
SKILL.md                      # Cursor（已有）
skills/claude-code/SKILL.md   # 指向同一 CLI
skills/codex/SKILL.md
skills/gemini-cli/README.md   # 若 Gemini CLI 无统一 skill 格式，写 GEMINI.md 片段
```

每个薄文件 ≤ 80 行，命令统一 `md-to-docx` / `bin/convert`。

5. **MCP tools 输入输出（JSON schema 锁定）**

`convert_markdown`

```json
{
  "input_path": "string (optional)",
  "markdown": "string (optional, one of path/markdown required)",
  "output_path": "string (optional)",
  "preset": "string (optional)",
  "template": "string (optional)",
  "toc": "boolean (optional)",
  "engine": "native|pandoc (optional)"
}
```

返回：`{"ok": true, "output_path": "...", "warnings": []}`

`validate_document`：走 P1D `--check` 逻辑，返回 Issue 列表。

`apply_template`：`input_path` + `template` + `output_path`。内部还是 convert。

`list_presets`：无参，返回 preset 名与说明。

`render_preview`：**P2A 不做 HTML 预览**（P2B 的事）。aim.md 列了这个 tool，推迟到 P2B，MCP README 写 `preview: not in 2.0, see web playground`。

6. **安全：** MCP 只写用户指定的 output_path；默认写到输入旁或系统临时目录。拒绝 `output_path` 指向 `/etc` 之类——做 `Path.resolve()` 后必须在 cwd、输入文件父目录、或 `MD_TO_DOCX_OUT` 下。测试覆盖 path jail。

---

#### Task 1 — 稳定 Python API（给 Skill/MCP 用）

**新建：** `scripts/md_to_docx/api.py`

```python
def convert(
    source: str | Path,
    *,
    output: Path | None = None,
    preset: str | None = None,
    template: Path | None = None,
    engine: str | None = None,
    toc: bool | None = None,
    markdown_text: str | None = None,
) -> ConvertResult:
    ...
```

`source` 可以是 Path；若 `markdown_text` 提供则写入 temp md 再转。

`ConvertResult`: `output_path`, `warnings: list[str]`, `engine`.

CLI 与 MCP 都调它。**禁止** MCP subprocess 调 CLI（易碎）；允许 Skill 文档告诉 Agent 跑 CLI（Agent 环境更简单）。

测试 `tests/test_api.py`。

---

#### Task 2 — MCP server

**新建：** `scripts/md_to_docx/mcp/server.py`、`__main__.py`

入口：`python -m md_to_docx.mcp`

`pyproject.toml`：

```toml
[project.optional-dependencies]
mcp = ["mcp>=1.0"]

[project.scripts]
md-to-docx-mcp = "md_to_docx.mcp.server:main"
```

README 片段 `references/mcp.md`：Claude Desktop 配置示例：

```json
{
  "mcpServers": {
    "md-to-docx": {
      "command": "md-to-docx-mcp"
    }
  }
}
```

测试：用 mcp SDK 的内存 transport 或直接调 tool 函数（把 handlers 写成纯函数 `handle_convert(args) -> dict`，server 只做注册）。**不要** 用真实 stdio 集成测试卡 CI。

Path jail 单测。

---

#### Task 3 — Skill 文档升级

重写根 `SKILL.md`：

- description 含 `AI-generated Markdown`, `professional Word`, `preset technical`
- Agent workflow：
  1. 找 skill-root / 或 PATH 上 `md-to-docx`
  2. 用户若说企微 → `--preset wecom`
  3. 用户若说正式技术方案/设计文档 → `--preset technical --toc --numbering`
  4. 用户若说学术 → academic
  5. 转换后报告输出路径，不改源 md
  6. 含 mermaid 检查 mmdc
- 不要上传企微

薄包装 skills/* 只写「如何安装/symlink」+「执行同一 CLI」。

`references/agents.md`：给 ChatGPT（无 skill 协议）的复制粘贴提示词：说明安装 CLI 后让它输出 md 并给出转换命令，而不是假装 ChatGPT 能跑 MCP。

---

#### Task 4 — 错误信息（DX）

所有 MCP error 返回：

```
problem: ...
cause: ...
fix: ...
docs: https://github.com/sunliang11/md-to-docx/blob/main/references/mcp.md
```

CLI 已有 error 风格保持一致。缺 pandoc 且 engine=pandoc 时：fix 写 brew install pandoc。缺 mmdc：fix 写 npm i -g @mermaid-js/mermaid-cli **或** 去掉 mermaid / 用 `--engine native` 当代码块。

测试：故意 missing template，断言 stderr 含 `fix:`。

---

#### Task 5 — 文档与 CHANGELOG

README 增加 **Use with AI** 小节（Cursor / Claude Code / MCP），链到 references。强调无 API key。

CHANGELOG Added MCP + multi-skill docs。

---

#### 验收命令

```bash
pip install -e ".[mcp,dev]"
pytest tests/ -v
python -m md_to_docx.mcp --help || python -m md_to_docx.mcp --version
python -c "from md_to_docx.api import convert"
```

若 MCP SDK `--help` 立即 stdio 阻塞：`--help` 必须在进入 stdio 前处理。`main()` 先看 argv。

---

#### Handoff

P2B 用同一 `api.convert` 做 Web。P2C 浏览器扩展调 Web 或本地。不要在扩展里再实现一份 parser。

---

#### Execution log

**2026-09-02** — P2A complete.

```bash
pip install -e ".[mcp,dev,web]"
pytest tests/test_api.py tests/test_mcp.py -v   # 13 passed
python -c "from md_to_docx.api import convert"
python -m md_to_docx.mcp --help
```

Delivered: `api.py`, `errors.py`, `mcp/server.py` + handlers, SKILL.md rewrite, `skills/*`, `references/mcp.md`, `references/agents.md`.

---

## P2B — web playground

<!-- source: P2B-web-playground.md -->

### P2B — Web Playground + Docker（v1.5 / v2.0 体验层）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1D `DONE`。P2A 的 `api.convert` 若已存在必须复用；若 P2A 未做，本 plan 允许直接调 `api.py`——若 `api.py` 还不存在，先把 P2A Task 1 做完再继续，不要复制引擎。
> **Depends on:** P1D（硬）、P2A Task 1（软）
> **Unblocks:** P2C
> **Target version:** 体验层，不强制 bump 引擎大版本。Playground 作为仓库子目录 `web/`。

---

#### Execution contract

##### Goal

陌生人 30 秒、无需本地安装，把一段 AI Markdown 变成可下载的 DOCX。这是 Demo 驱动增长的落地页。

##### 禁止

- 账号系统、计费、多租户、把用户文档存对象存储当产品（可 ephemeral /tmp）
- 调用 OpenAI API「帮你改文章」
- 在浏览器用 JS 重写一份 Markdown→DOCX
- 一开始就做 Cloud API 网关（P4）
- 把 playground 做成必须连官方 SaaS 才能用 CLI

##### Done when

- [ ] `web/` 能本地 `docker compose up` 打开编辑器 + Generate DOCX
- [ ] 左侧 Markdown，右侧 **HTML 近似预览**（不是真 Word 排版引擎，UI 要标明 Preview approximation）
- [ ] 可选手 preset，下载 docx
- [ ] 无安装路径：README 有「Try locally with Docker」；若无公开托管，不要在 GitHub README 放死链 Try Online
- [ ] 转换走 Python 引擎，同一套 presets
- [ ] 有基础限流：body 大小上限、超时

---

#### 锁定决策

1. **技术栈：**
   - 后端：FastAPI，调用 `md_to_docx.api.convert`
   - 前端：单页，无 React 强迫。锁定 **Vite + vanilla TS** 或 **单 HTML +  codemirror 6 CDN**。为减少依赖：**FastAPI 托管 `web/static`，前端一个 `index.html` + `app.js` + `app.css` + textarea**。Preview 用 `markdown-it` 在浏览器渲染 HTML。够 30 秒体验。
   - 不要 Next.js、不要 SSR。
2. **布局（ASCII 已在 aim.md）：** 左右分栏 50/50，顶栏：preset `<select>`、按钮 `Generate DOCX`、`Copy CLI command`。
3. **托管：** P2B 默认只交付 Docker 自托管。GitHub README 的 Try Online 仅当用户稍后自己部署（Pages 不能跑 Python）。可加 `Dockerfile` 注释 fly.io/render 一键，但 **不要** 注册云账号。
4. **隐私文案：** 页脚 `Documents are converted in memory/temp and deleted. Self-host with Docker.`
5. **体积上限：** Markdown 400KB，上传图片每张 5MB，最多 20 张。超时 30s。
6. **Mermaid：** Playground 调后端 native 引擎；容器内可选安装 mermaid-cli（Docker image 分 `slim` 无 mmdc / `full` 有）。默认 compose 用 `slim`，README 说明 flowchart 在 slim 里当代码块。
7. **仍不拆仓库。** `web/` 留在 md-to-docx 内。

---

#### 目录结构

```
web/
  README.md
  Dockerfile
  Dockerfile.full          # optional mermaid
  docker-compose.yml
  app.py                   # FastAPI
  static/index.html
  static/app.js
  static/app.css
  examples/                # 启动时加载的示例 md（可 symlink ../../examples）
tests/test_web_api.py      # 只测 FastAPI，用 TestClient
```

根 README 链 `web/README.md`。`.dockerignore` 排除 `.git` tests fixtures 大文件。

---

#### Task 1 — FastAPI

```python
POST /api/convert
Content-Type: application/json
{ "markdown": "...", "preset": "technical", "toc": true }

→ application/vnd.openxmlformats-officedocument.wordprocessingml.document
  Content-Disposition: attachment; filename="document.docx"
```

`GET /api/presets` → 列表。

`GET /healthz` → `{"ok": true, "version": "..."}`

错误 JSON：`{"problem","cause","fix"}`，HTTP 400/413/500。

不要 GET convert（URL 太长）。

CORS：默认只 `*` 给自托管；注释生产应变。

---

#### Task 2 — 静态前端

- textarea 等宽字体，placeholder 为 `# Technical Report`
- 右侧 preview 随输入 debounce 300ms 刷新（纯前端 markdown-it，**不**调后端）
- Generate：fetch `/api/convert`，blob download `document.docx`
- 失败：alert 区域显示 problem/cause/fix
- 示例下拉：加载 `/examples/technical-report.md` 等 FastAPI 从仓库 examples 读
- 无登录、无 localStorage 强制；可用 localStorage 存最后草稿（可选加分）

无障碍：按钮可键盘点；对比度不要灰字灰底。

---

#### Task 3 — Docker

`web/Dockerfile`：

- `python:3.12-slim-bookworm`
- 安装项目 `pip install /app`（copy 仓库）
- 系统 **不** 装 pandoc（native 足够）。wecom preset 在 playground 下拉里 **隐藏或标注 needs pandoc**。Playground 只暴露 native presets。
- `CMD uvicorn md_to_docx.web:app` 或 `web.app:app`
- 端口 8080
- 非 root 用户

`docker-compose.yml`：

```yaml
services:
  playground:
    build:
      context: ..
      dockerfile: web/Dockerfile
    ports: ["8080:8080"]
```

`web/README.md`：

```bash
docker compose -f web/docker-compose.yml up --build
### open http://localhost:8080
```

---

#### Task 4 — 安全与滥用

- 请求体大小 Starlette `max_part_size`
- convert 在 threadpool，timeout 30s
- 临时文件 `tempfile.TemporaryDirectory` 请求结束删除
- 无路径穿越：只接受 JSON markdown 字符串，不接受服务器本地 path（与 MCP 不同）。**Playground 禁止 `input_path` 读容器文件系统。**
- 不执行 Markdown 里的 HTML script 在 preview：markdown-it html:false

测试：超大 body 413；xss 字符串 preview 转义。

---

#### Task 5 — 文档与 Demo 回写

P0 的 hero 若仍是 CLI-only，追加 `assets/demo/playground.png` 占位或 GIF（可选）。README 增加 Docker 一节。**没有公网 URL 就不要写 Try Online 按钮。**

CHANGELOG。

---

#### 验收命令

```bash
pip install -e ".[dev]"
pip install fastapi uvicorn httpx
pytest tests/test_web_api.py -v
### 可选
docker compose -f web/docker-compose.yml up --build
curl -sS http://localhost:8080/healthz
```

无 Docker 时：`uvicorn` 本地起，用 TestClient 仍必须全绿。在 Execution log 注明是否做了浏览器手点。

浏览器手点清单（有 browser 工具就做）：

1. 打开首页左右栏可见
2. 选 technical，Generate，下载非空 docx
3. 空 markdown Generate 显示校验错误
4. 预览随输入更新

---

#### Handoff

P2C 扩展的「Export」可以 POST 到用户自托管的同一 `/api/convert`，默认 `http://localhost:8080`。不要把扩展绑死官方云。

---

#### Execution log

**2026-09-02** — P2B complete.

```bash
pip install -e ".[web,dev]"
pytest tests/test_web_api.py -v   # 6 passed
### Docker: docker compose -f web/docker-compose.yml up --build
```

Delivered: `web/app.py`, static SPA, Dockerfile + compose, `.dockerignore`, `web/README.md`. Browser hand-test not run in CI; TestClient covers API.

---

## P2C — browser extension

<!-- source: P2C-browser-extension.md -->

### P2C — Browser Extension：Export AI to Word（v2.5）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1D `DONE`，P2B `/api/convert` 已存在（扩展把 Markdown POST 到转换服务）
> **Depends on:** P2A（推荐）、P2B（硬：需要 convert HTTP 或把引擎编译进扩展——后者禁止）
> **Target version:** 扩展独立版本 `0.1.0`，引擎不必 bump

---

#### Execution contract

##### Goal

在 ChatGPT / Claude / Gemini / DeepSeek / Kimi / 豆包 的对话页出现 **Export to Word**。点击后抽取当前 AI 回答的 Markdown，转成 DOCX 下载。

##### 禁止

- 「万能网页转 Word」
- 把页面 HTML 当 Word 导出（必须尽量还原 Markdown）
- 扩展内实现 AST/DOCX（WASM 全套太重，且会分叉）
- 强制用户把对话上传到你们云。默认：本机 Playground `http://127.0.0.1:8080` 或「仅下载 .md」降级
- 窃取 cookie、读全部浏览历史、任意站注入

##### Done when

- [ ] Chrome Manifest V3 扩展在 `browser-extension/`
- [ ] 上述站点白名单 content script
- [ ] 按钮 Export to Word
- [ ] 选项页：convert endpoint、preset
- [ ] 端点不可达时：下载 `.md` 并提示跑 Docker Playground 或 CLI
- [ ] README 演示 GIF 叙事：打开 Claude → Export → 得到 Word

---

#### 锁定决策

1. **转换发生在本地 HTTP 引擎（P2B）或用户配置的自托管 URL。** 扩展只做抽取 + POST + 下载。
2. **抽取策略按站点适配器。** 每个适配器返回 `{markdown: string, title: string}`。不要一个巨大 regex。
3. **权限：** `activeTab` + host_permissions 仅白名单 + `storage`。不要 `https://*/*`。
4. **Firefox** 本阶段不做，但避免明显不兼容 MV3 API，方便以后。
5. **仍不拆 git 仓库**，目录 `browser-extension/`。
6. **不发 Chrome Web Store** 除非用户要求。文档写 Load unpacked。

---

#### 目录结构

```
browser-extension/
  README.md
  manifest.json
  src/background.js
  src/options.html
  src/options.js
  src/content/chatgpt.js
  src/content/claude.js
  src/content/gemini.js
  src/content/deepseek.js
  src/content/kimi.js
  src/content/doubao.js
  src/button.css
  src/lib/extract.js
  src/lib/export.js
  icons/icon16.png
  icons/icon48.png
  icons/icon128.png     # 从 assets/branding/logo.svg 导出 PNG
```

---

#### Task 1 — manifest 与按钮注入

`manifest.json` MV3：

- `content_scripts` matches 锁定（实现时再核对真实域名，写进 Execution log）：
  - `https://chatgpt.com/*`
  - `https://claude.ai/*`
  - `https://gemini.google.com/*`
  - `https://chat.deepseek.com/*`
  - `https://kimi.moonshot.cn/*` 与 `https://www.kimi.com/*`（以当时为准）
  - `https://www.doubao.com/*` / `https://www.volcengine.com/*` 豆包实际对话域
- 每个文件独立 matches，避免在错误站跑错误适配器

按钮：固定在**最后一条 assistant 消息**工具条旁，文案 `Export to Word`，不要遮挡输入框。

---

#### Task 2 — 适配器

每个适配器：

```js
export function extractLatestAssistantMarkdown(document) {
  return { markdown, title }
}
```

优先：站点若有「复制 Markdown」按钮，用其数据源（DOM 属性/data）。否则：从消息节点做 HTML→Markdown（白名单标签：p, h1-h6, pre/code, ul/ol/li, table, a, img, blockquote, em, strong）。用现成小函数，不要引入巨大 turndown 除非体积可接受。允许依赖 `turndown` 打进扩展（单文件 vendor）。

代码块：保留 fence 语言 class。

失败：toast `Could not find an AI reply on this page`。

每个适配器 `tests` 用 jsdom 夹具 HTML（保存匿名化 DOM 快照在 `browser-extension/testdata/`）。站点改版会挂，测试至少保证选择器模块化。

---

#### Task 3 — Export 流程

1. extract
2. `chrome.storage` 读 `endpoint`（默认 `http://127.0.0.1:8080`）和 `preset`（默认 `technical`）
3. `POST ${endpoint}/api/convert` JSON
4. 成功：`download` API 存 `title.docx`
5. 失败：保存 `title.md`，badge 提示 `Start playground: docker compose ...`

CORS：P2B FastAPI 必须允许扩展 origin。给 P2B 补：`chrome-extension://*` CORS。若 P2B 已 `*`，足够。

本地 HTTP：扩展访问 `127.0.0.1` 在 Chrome 可能要提示用户。选项页写明。

---

#### Task 4 — 选项页

字段：Endpoint URL、Preset select、Fallback download markdown checkbox（默认 true）。

保存 chrome.storage.sync。

---

#### Task 5 — 图标与文档

从 P0 SVG 导出 PNG。`browser-extension/README.md`：Load unpacked 步骤、隐私（对话只发到你填的 endpoint）、站点列表。

根 README Integration 列表加 Browser extension。

不要在 SKILL.md 写扩展（那是 agent 路径）。

---

#### 验收

- `python -m json.tool browser-extension/manifest.json`
- jsdom 单测若用 Node：`browser-extension/package.json` 仅 devDependencies，不要让根 Python CI 必须跑 npm。扩展测试：`npm test` 写在 extension README，根 CI **可选** job `extension`（可先 skip）。
- 人工：Docker playground 开着，chatgpt.com 或任意一个适配器页（无账号则用 testdata + mock）

Agent 无真实 ChatGPT 登录时：用 testdata HTML 跑抽取单测即视为代码完成，Execution log 标明未实站点击。

---

#### Handoff

P3 不要把扩展改成 IDE。VS Code 是另一条入口。

---

#### Execution log

**2026-09-02** — P2C complete.

Domains in manifest: `chatgpt.com`, `claude.ai`, `gemini.google.com`, `chat.deepseek.com`, `kimi.moonshot.cn`, `www.kimi.com`, `www.doubao.com`.

```bash
python -m json.tool browser-extension/manifest.json
cd browser-extension && npm test   # 4 passed
```

No live site click (no logged-in session); testdata HTML + jsdom adapters verified. CI job `extension` added.

---

## P3A — roundtrip / action

<!-- source: P3A-roundtrip-action.md -->

### P3A — Roundtrip、Document Diff、GitHub Action（v3.0）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P1D `DONE`（AST 是唯一真相）。P2A 建议已完成（Action 与 CLI 同 API）。
> **Depends on:** P1D
> **Unblocks:** P3B
> **Target version:** `3.0.0` 仅当 CLI 有破坏性变化；否则 `1.x` 加 subcommands。锁定：**用 subcommands，避免破坏 `md-to-docx file.md`。**

---

#### Execution contract

##### Goal

文档变成可编程：DOCX 能进 AST/Markdown；两个版本能 diff；Git 里 Markdown 是源，DOCX 是构建产物（GitHub Action）。

##### 禁止

- 100 个插件接口（P3B 才最小 API）
- VS Code / Obsidian（P3B）
- 为 diff 引入 electron GUI
- 「AI 改第三章」闭环（P4）
- 声称完美 roundtrip 所有 Word 特性（SmartArt、文本框、宏一律不支持）

##### Done when

- [ ] `md-to-docx reverse in.docx -o out.md` 产出可读 Markdown
- [ ] 自产自销黄金件：native 引擎生成的 docx → reverse → parse，关键 block 类型计数误差在阈值内
- [ ] `md-to-docx diff a.md b.md` 与 `diff a.docx b.docx`（先 reverse 再比 AST）
- [ ] GitHub Action `uses: sunliang11/md-to-docx@v3`（实现可先放本仓库 `action/`）
- [ ] 不支持的 OOXML 降级并 warning，不 crash

---

#### 锁定决策

1. **Roundtrip 路径：**

```
DOCX → OOXML parse → Document AST → Markdown writer
```

不要 docx→pandoc→md 当默认（质量不可控）。允许 `--engine pandoc` reverse 作 fallback。

2. **DOCX parser 范围（v3 只读这些）：**
   - 段落 styles Heading1–6 / Normal
   - 粗斜体删除线等宽
   - 超链接
   - 表格
   - 图片（抽出 `media/` 写到 `{stem}-media/`）
   - 列表（numPr → ListBlock，尽力）
   - 分页符
   - 脚注（若 P1C 已写）
   - 域 TOC：reverse 时丢掉 TOC 段落，避免目录变成正文垃圾
   - OMML → `$latex$` 尽力；失败则 Unicode/纯文本

3. **Markdown writer：** `scripts/md_to_docx/write/markdown.py`。CommonMark + GFM 表 + fence。PageBreak 写成 `<!-- pagebreak -->`。Figure caption 写成 `![cap](path){#fig:id}`。

4. **Diff：** AST 结构化 diff，不是 git 文本 diff 唯一输出。输出格式：
   - 默认 human text（`+` `-` `~` 段落级）
   - `--format json` 给工具
   - `--format md` 生成 changelog 风格

5. **Action：** Docker 或 composite 跑官方 Python。锁定 **composite + setup-python + pip install 本 action 附带的 wheel 或 pip from git tag**。输入 `input` `preset` `output-dir`。把 docx 当 artifact 的步骤写在 action README 示例，不在 action 里强制 upload。

6. **包结构新增：**

```
scripts/md_to_docx/parse/docx.py
scripts/md_to_docx/write/markdown.py
scripts/md_to_docx/diff/ast_diff.py
action/action.yml
action/README.md
```

---

#### Task 1 — DOCX → AST

实现 `parse_docx(path: Path) -> Document`。用 `zipfile` + `lxml`（已有 dev 依赖，升到主依赖若 reverse 是核心——锁定 **lxml 进主依赖**，因为 native renderer 测试已用；runtime reverse 需要它）。

只解析 `word/document.xml` + relationships + `word/media`。styles 用 `w:pStyle` val 映射 heading。

复杂 `w:drawing`：提取 `a:blip` rId。忽略图表。

测试 `tests/test_parse_docx.py`：用 native 渲染 `sample.md` 再 parse 回来，断言：

- heading 文本相同
- 至少一张表
- 代码块文本相同（允许尾换行差异）

---

#### Task 2 — AST → Markdown writer

`write_markdown(doc: Document) -> str`

测试：`parse_markdown(write_markdown(parse_markdown(src)))` 对 sample.md **block 类型序列**相同。允许 inline 空白差异。这是 roundtrip 的核心契约。

不要要求字节级 md 不变。

---

#### Task 3 — CLI subcommands

保持默认：`md-to-docx [options] PATH` 仍是 convert（argparse subparsers 时：无 subcommand 则 convert，避免破坏）。

实现方式锁定：

```
md-to-docx convert ...   # 与今日默认相同，可省略 convert
md-to-docx reverse in.docx -o out.md
md-to-docx diff a b [--format text|json|md]
md-to-docx check ...     # P1D --check 也可迁到这，但保留 --check flag 别拆掉
```

`diff`：输入可以是 .md 或 .docx（按后缀）。两边都变成 AST 再比。

---

#### Task 4 — AST Diff

`diff_documents(a: Document, b: Document) -> list[Change]`

```python
@dataclass
frozen=True
class Change:
    op: Literal["add", "remove", "replace"]
    path: str          # e.g. blocks[3]
    summary: str       # "heading: Architecture"
```

算法：按 block 序列 Myers 或简单 LCS（标准库即可）。不要依赖外部 diff 库除非已有。

Human 输出示例（aim.md）：

```
+ Added architecture
~ Modified section 3
- Removed old solution
```

测试：两份仅 H2 文本不同的 Document。

---

#### Task 5 — GitHub Action

`action/action.yml`：

```yaml
name: md-to-docx
description: Compile Markdown to professional DOCX
inputs:
  input:
    required: true
  preset:
    default: technical
  output-dir:
    default: dist/docx
  engine:
    default: native
runs:
  using: composite
  steps:
    - uses: actions/setup-python@v5
      with:
        python-version: "3.12"
    - run: pip install "${{ github.action_path }}/.."
      shell: bash
    - run: md-to-docx "${{ inputs.input }}" --preset "${{ inputs.preset }}" --output-dir "${{ inputs.output-dir }}" --engine "${{ inputs.engine }}"
      shell: bash
```

注意：`pip install ..` 在 action 作为子目录时路径要对。用 `github.action_path` 指向 `action/` 则 package root 是 `..`。

示例 workflow 写在 `action/README.md`：

```yaml
- uses: sunliang11/md-to-docx/action@v3
  with:
    input: docs/report.md
    preset: technical
- uses: actions/upload-artifact@v4
  with:
    name: docx
    path: dist/docx
```

根 README 加 Git workflow 一节：md 进 git，docx gitignore 可选。

CI：加 job 用本仓库 action 转换 `examples/meeting-notes/example.md`（`uses: ./action`）。

---

#### Task 6 — 文档与限制清单

`references/roundtrip.md`：支持矩阵。明确不支持：文本框、SmartArt、修订模式、宏、嵌入 Excel。

CHANGELOG。SKILL.md 增加 reverse/diff 何时用（用户给了 docx 要改成 md 源）。

---

#### 验收命令

```bash
pip install -e ".[dev]"
pytest tests/test_parse_docx.py tests/test_write_markdown.py tests/test_diff.py tests/test_roundtrip.py -v
python -m md_to_docx tests/fixtures/sample.md --output-dir /tmp/p3a
python -m md_to_docx reverse /tmp/p3a/sample.docx -o /tmp/p3a/back.md
python -m md_to_docx diff tests/fixtures/sample.md /tmp/p3a/back.md
```

roundtrip 测试允许 `Change` 列表为空或仅 whitespace。

---

#### Handoff

P3B 的 Plugin API 应挂在 parse/transform/render 钩子上。reverse 不要绕过 AST。

---

#### Execution log

- 2026-09-02: P3A implemented — `parse/docx.py`, `write/markdown.py`, `diff/ast_diff.py`, CLI `reverse`/`diff`, `action/`, tests, `references/roundtrip.md`.

---

## P3B — editors / plugin API

<!-- source: P3B-editors-plugin-api.md -->

### P3B — VS Code、Obsidian、最小 Plugin API（v3.5）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P3A `DONE`（AST + CLI convert/reverse 稳定）
> **Depends on:** P3A
> **Unblocks:** P4
> **Target version:** 编辑器扩展各自 `0.1.0`；引擎 bump `1.x` 或 `3.5.0` 仅当 Plugin API 进入主包。

---

#### Execution contract

##### Goal

开发者在熟悉的编辑器里一键导出 Word；第三方能写**真实需要的**插件（先内部把 Mermaid/Math 迁到 plugin 接口，证明 API 不是空想）。

##### 禁止

- 100 个接口、SPI、OSGi、复杂生命周期
- 没先有第二个真实插件就抽象 Marketplace
- 在 VS Code 里用 JS 重写转换器
- Obsidian 收费插件商店作为本阶段目标

##### Done when

- [ ] VS Code：右键 `Export Markdown to Word` + 命令面板 `MD: Export to DOCX`
- [ ] Obsidian：命令 `Export to Professional Word`
- [ ] Python `Plugin` 协议：`name`, `transform(document) -> document`，可选 `parse_fence(lang, text)`
- [ ] 内置 mermaid 与 math 改为通过该协议注册（行为与 P1C 兼容）
- [ ] 第三方插件：文档示例 `uppercase_headings` 10 行
- [ ] 仍无插件市场网站

---

#### 锁定决策

1. **编辑器扩展只 spawn CLI 或调用本机 `md-to-docx`。** 检测 PATH；没有则提示 pip/clone。不要把整个 Python 打进 VSIX。
2. **VS Code 目录：** `editors/vscode/`（本仓库）。`package.json` 命令 `md-to-docx.export`。输出旁路同名 docx 或 `out/` 配置项。
3. **Obsidian 目录：** `editors/obsidian/`。使用 Obsidian plugin API `Notice` + `exec`。桌面端 only；移动端显示不支持。
4. **Plugin API 极小：**

```python
class Plugin(Protocol):
    name: str
    def transform(self, document: Document) -> Document:
        return document

@dataclass
class PluginContext:
    base_dir: Path
    config: dict[str, object]
```

加载：`--plugin path/to/mod.py` 多次。入口 `plugin = Plugin()` 或模块级 `class` 发现。**不**做 setuptools entry_points 扫描（可在 P4 加）。先显式 CLI。

5. **先有真实需求再抽象：** 把 P1C mermaid/math 迁到 `scripts/md_to_docx/plugins/mermaid.py` 与 `math.py`，默认 enabled。证明 transform 钩子够用。不要为图表再发明 Renderer 插件接口，除非 transform 不够——Mermaid 需要「fence→图文件」副作用：允许 plugin 实现 `render_assets(document, ctx) -> Document` 第二钩子。**最多两个钩子。**

```python
class Plugin(Protocol):
    name: str
    def render_assets(self, document: Document, ctx: PluginContext) -> Document: ...
    def transform(self, document: Document, ctx: PluginContext) -> Document: ...
```

两者都有默认 no-op mixin `PluginBase`。

6. **不拆 GitHub org。** 编辑器扩展先住在主仓库。README 说明未来可迁 `md-to-docx-vscode`。

---

#### Task 1 — PluginBase + 加载器 + 迁移 mermaid/math

**新建：** `scripts/md_to_docx/plugin/base.py`、`loader.py`、`builtin.py`

`engine/native.py`：parse 之后 `for p in plugins: doc = p.render_assets(doc, ctx); doc = p.transform(doc, ctx)`。

默认插件列表：mermaid, math, captions（captions 也可当 plugin）。

`--no-plugins` 关掉内置（调试用）。

`--plugin ./my.py` 追加。

测试：uppercase plugin 夹具；`--no-plugins` 时 mermaid 保持 CodeBlock。

文档 `references/plugins.md`：警告不要在 plugin 里 import python-docx。资产渲染可以用文件系统。

---

#### Task 2 — VS Code 扩展

`editors/vscode/package.json`：

- activationEvents：`onCommand:md-to-docx.export`
- menus：`editor/context` when `resourceLangId == markdown`
- configuration：`md-to-docx.path`、`md-to-docx.preset`、`md-to-docx.extraArgs`

`extension.ts` 或 JS：`child_process.spawn` CLI，output channel 显示 stderr。成功 `showInformationMessage` 带 Open DOCX（`vscode.env.openExternal`）。

`editors/vscode/README.md`：F5 调试、打包 `vsce package`（不发布市场除非用户要求）。

不要提交 `node_modules`。

根 CI **不**强制编译 VS Code（无 Node 矩阵也可）。扩展 README 写 `npm test` 可选。

---

#### Task 3 — Obsidian 插件

`editors/obsidian/main.ts`（或 JS 若要零构建：锁定 **JS 无构建** 减少工具链：`main.js` + `manifest.json`）。

manifest：id `md-to-docx`、version `0.1.0`。

命令：Export current file / Export folder。调用 `md-to-docx`，输出到 vault 同目录或配置的 `docx/`。`.gitignore` 建议用户忽略 docx。

桌面 `require('child_process')`；失败 Notice。

文档：如何把文件夹拷进 `.obsidian/plugins/md-to-docx/`。

---

#### Task 4 — 示例第三方插件

`examples/plugins/uppercase_headings.py` + README。CI 用它跑一个 md 证明 `--plugin` 有效。

---

#### Task 5 — 文档矩阵

根 README 增加 Editors 表：VS Code / Obsidian / CLI / MCP / Browser。CHANGELOG。

aim.md 产品矩阵仍是未来 org；本阶段 README 写「monorepo folders」。

---

#### 验收

```bash
pip install -e ".[dev]"
pytest tests/test_plugin_loader.py -v
python -m md_to_docx tests/fixtures/sample.md --plugin examples/plugins/uppercase_headings.py --output-dir /tmp/p3b
```

VS Code/Obsidian：无 GUI 时至少 `manifest.json`/`package.json` 合法 JSON；Execution log 标明未在 IDE 点击。

---

#### Handoff

P4 Marketplace 建立在「显式 plugin 文件 + 模板 docx」之上，不要重做 API。Document Standard 在 P4 冻结语法。

---

#### Execution log

- 2026-09-02: P3B implemented — Plugin API, mermaid/math/captions plugins, VS Code + Obsidian extensions, `examples/plugins/uppercase_headings.py`, `references/plugins.md`. VS Code/Obsidian not manually clicked in IDE (manifest/package.json validated in CI).

---

## P4 — ecosystem

<!-- source: P4-ecosystem.md -->

### P4 — Ecosystem：标准、市场、Cloud、AI Editing（v4.0）

> **For AI agents:** Read this entire file before writing any code.
> **Prerequisite:** P3B `DONE`。没有真实第三方模板/插件需求时，**不要实施本 plan 的 Marketplace 与 Cloud。** 先做 Task 0 门闩。
> **Depends on:** P3B
> **Target version:** `4.0.0`

---

#### Execution contract

##### Goal

让别人给 md-to-docx 提交模板、插件和集成；DOCX 仍是第一公民；核心引擎继续开源。10k star 是生态结果，不是本 plan 的验收项。

##### 禁止

- 把核心转换引擎闭源去做 SaaS
- 引擎绑定单一 AI 供应商
- 变成万能 PDF/HTML/PPT 工厂（HTML/PDF renderer 可以有，但不得拖垮 DOCX 质量）
- 未出现真实插件作者就做支付、评分、推荐算法
- 过度设计 Document Standard 的 50 个 container

##### Done when（分闸，允许只完成 Gate A）

Gate A 必须：Document Markdown Spec 文档化 + 模板贡献流程（PR 到 `templates/`）。

Gate B 有 3 个外部模板 PR 或 2 个外部插件后再做：静态 Marketplace 页。

Gate C 有稳定流量后再做：Cloud API（开源引擎 + 可选托管）。

Gate D：AI Document Editing（DOCX→AST→MD→AI→MD→AST→DOCX）且 AI 在外围。

Agent 一次只做 **一个 Gate**。做完停下。

---

#### Task 0 — 门闩（每次开 P4 先跑）

在 Execution log 写证据：

1. GitHub 是否已有外部 contributor 提交模板或插件？issue 数量？
2. Monthly documents generated 有没有粗测（CLI `--telemetry` 默认关，不要偷偷上报）
3. 若没有任何外部需求：只允许做 Gate A 的 spec 文档，然后 **STOP**

没有证据就做 Cloud = 失败。

---

#### Gate A — Open Document Markdown Spec + 模板贡献

##### A.1 Spec 文档

新建 `spec/document-markdown.md`（版本 `odm-0.1`）：

锁定已实现语法（不要发明未实现的）：

- CommonMark + GFM
- YAML frontmatter 字段表：`title author date template toc numbering preset`
- `<!-- pagebreak -->` 与 `:::pagebreak`
- `![alt](src){#fig:id}`、`Table: caption {#tbl:id}`、`[@fig:id]`
- `$math$` `$$math$$`
- ` ```mermaid `
- footnotes
- 明确 **非目标：** 任意 HTML、自定义 XML

`:::warning` 仅当已有 renderer 支持 callout。**P4 之前没做就不要写进 spec。** 若要做 callout：先一个 Task 实现 `:::warning|info|note` 三个，再写进 spec。锁定：Gate A 可以加这三个 callout（AST `Callout` 节点 + 渲染为带底色的表格或段落）。这是「标准」该有的最小扩展。

##### A.2 Callout 实现（仅三个）

Parser container → `Callout(kind, children)`。Renderer：左边框颜色。测试三份。

##### A.3 模板贡献

```
templates/
  README.md                 # 命名、预览图、license、PR 要求
  technical-design/
  mckinsey-like-report/     # 命名不要侵权：用 `consulting-report`
  ieee-like-paper/          # 用 `academic-ieee-ish` 或 `conference-paper`
  chinese-official/
```

每个模板：`template.docx`、`preview.png`、`sample.md`、`LICENSE`（必须允许再分发）。PR 模板 checklist：Word 打开、CJK、无宏、无嵌入个人信息。

CI：对 `templates/**/sample.md` `--template` 转换成功。

根 README Marketplace 暂时就是这个目录。

##### A.4 PDF/HTML renderer — **不做完整产品**

允许实验目录 `scripts/md_to_docx/render/html.py` 把 AST 打成简单 HTML（Playground 预览可改走它）。**禁止** 本 Gate 做 PDF（weasyprint/prince 依赖地狱）。PDF 另开 plan。

验收：spec 文件存在、callout 测试绿、至少一个新社区模板目录（即使是官方示例）。

---

#### Gate B — 静态 Marketplace

仅当 Task 0 证明有外部贡献。

- GitHub Pages 或 `marketplace/` 静态站：列出 `templates/` 与 `examples/plugins/`
- 每卡片：截图、作者、license、安装（clone 路径）
- 无账号、无上传 API、合并走 GitHub PR
- Plugin 列表同样

不要自建用户系统。

---

#### Gate C — Cloud API

仅当自托管 Docker 已有真实用户喊「不想跑 Docker」。

原则：

- 同一 FastAPI 从 P2B 抽 `packages/server`
- 鉴权：先 API token 文件，不做社交登录
- 计费：本 Gate **不做**
- SLA：文档写 best-effort
- 核心 `scripts/md_to_docx` 继续 MIT
- README 大字：Self-host is first-class

实现：`POST /v1/convert` multipart，返回 docx。OpenAPI 生成。SDK **先不出**，curl 示例足够。

安全：与 P2B 相同限额；malware 扫描不做（docx 是我们生成的）。上传 md 扫描过大。

**禁止** 把用户文档用于训练。隐私政策一页 markdown。

---

#### Gate D — AI Document Editing

外围流程，引擎不调模型：

```
md-to-docx reverse report.docx -o report.md
### 用户/Agent 编辑 report.md（任意模型）
md-to-docx convert report.md --template original.docx -o report-v2.docx
md-to-docx diff report.docx report-v2.docx
```

Skill/MCP 增加 tool：`edit_roundtrip` 说明三步，**仍不内置 API key**。

可选：`--preserve-template` 从原 docx 抽 styles 当 `--template`（P1B 已能吃 docx 模板）。若 reverse 丢掉样式：实现 `extract_template(docx) -> temp.docx`（剥 body 留 styles/header）。这是本 Gate 唯一引擎活。

测试：原 professional 模板色还在 v2。

不要做协同编辑 OT/CRDT。

---

#### 多渲染器终局（提醒）

```
AST → DOCX (第一公民)
    → HTML (预览)
    → PDF (未来，独立 plan)
```

任何 PDF 任务不得降低 DOCX 测试黄金件。

---

#### 组织拆分（最后才做）

仅当仓库太大：按 aim.md 拆 `md-to-docx-web` 等。本 plan Gate A–D **默认仍 monorepo**。拆仓需要单独 migration plan，不在这里执行 `git filter-repo`。

---

#### 验收（Gate A）

```bash
pytest tests/ -v
test -f spec/document-markdown.md
python -m md_to_docx tests/fixtures/callout.md --output-dir /tmp/p4
```

Gate B–D：各自补充 Execution log 证据链后再写子任务落地 PR。

---

#### 战略收口（给人类看）

错误路线：无限加 Markdown 方言。  
正确路线：AI → Markdown → Document Compiler → Professional DOCX，入口可以很多，引擎只有一个，且开源。

---

#### Execution log

##### 2026-09-02 — Task 0 门闩

1. **外部贡献**：`gh` CLI 未认证，无法查询远程 PR/issue。本地仓库无外部模板/插件 PR 记录 → **0 外部模板/插件 PR**。
2. **Monthly documents**：`--telemetry` 未实现；无默认上报 → 无法粗测，符合 plan 要求。
3. **结论**：无外部需求 → **仅执行 Gate A，跳过 Gate B–D**。

##### 2026-09-02 — Gate A 验收

```bash
pip install -e ".[dev]"
pytest tests/ -v                    # 全绿
test -f spec/document-markdown.md   # ok
python -m md_to_docx tests/fixtures/callout.md --output-dir /tmp/p4  # ok
pytest tests/test_callout.py tests/test_render_html.py -v  # 10 passed
```

**交付物：**
- `spec/document-markdown.md` (odm-0.1)
- Callout AST + parser + DOCX renderer (`:::warning|info|note`)
- `templates/` 四目录（technical-design, consulting-report, academic-ieee-ish, chinese-official）
- CI `Validate community templates` step
- 实验性 `scripts/md_to_docx/render/html.py`

**未做（按 plan）：** Gate B Marketplace、Gate C Cloud API、Gate D AI Editing。
