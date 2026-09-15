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
