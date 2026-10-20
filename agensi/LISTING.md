# Agensi listing copy — md-to-docx

Paste these fields into https://www.agensi.io/dashboard/submit (or the draft URL).

## Price

**Free**

## GitHub / source

https://github.com/sunliang11/md-to-docx

## Title

md-to-docx — AI Markdown to Professional Word

## Short description (card / one-liner)

Turn AI drafts and Markdown into deliverable Word DOCX locally—presets for technical, business, and academic docs. No API keys.

## Long description

### The problem

You write with ChatGPT, Claude, or Cursor. The draft is Markdown. Your boss, client, or review board wants Word. Copy-paste kills formatting. Online converters need uploads and keys.

### What you get

**md-to-docx** is an agent skill that compiles Markdown into professional `.docx` on the machine—headings, tables, code, callouts, optional TOC/numbering—using built-in presets.

**GitHub:** https://github.com/sunliang11/md-to-docx

### How to use (agent)

1. Ask: “Convert this report to Word with the technical preset.”
2. The agent runs `bin/convert` from this skill with the right `--preset`.
3. You get a `.docx` next to your `.md`. Source file is never modified.

### Presets at a glance

| Need | Preset |
|------|--------|
| Formal tech / design doc | `technical` (+ `--toc --numbering`) |
| Everyday document | `professional` |
| Long-form editorial | `editorial` |
| Academic | `academic` |
| Business summary | `business` |
| Generic report | `report` |

### Also included

- Reverse: Word → Markdown
- Diff: compare two document versions
- Optional Mermaid diagrams (if `mmdc` is installed)
- MCP docs for agent servers ([references/mcp.md](md-to-docx/references/mcp.md) in the package)

### Requirements

- Python 3.10+
- One-time: `pip install "markdown-it-py>=3" "mdit-py-plugins>=0.4" "python-docx>=1" "latex2mathml>=3" "lxml>=4.9"`

### Why free

Open-source core. List here so agents can discover and run the workflow; star and contribute on GitHub.

## Suggested tags

`markdown`, `docx`, `word`, `documents`, `ai`, `cursor`, `claude`, `report`, `technical-writing`, `mcp`

## Demo prompt (for reviewers / buyers)

> Convert `examples/sample.md` to a Word technical report with TOC and numbering.

Expected: `examples/sample.docx` created via `./bin/convert examples/sample.md --preset technical --toc --numbering`.
