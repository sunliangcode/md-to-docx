# Development

## Setup

Requires **Python 3.10+**.

```bash
git clone https://github.com/sunliang11/md-to-docx.git
cd md-to-docx
pip install -e ".[dev,mcp,web]"
```

## Lint

```bash
ruff check scripts/md_to_docx tests
ruff format scripts/md_to_docx tests
# optional:
pre-commit install && pre-commit run --all-files
```

## Type check

```bash
mypy   # progressive public surface; see [tool.mypy] in pyproject.toml
```

## Run tests

```bash
pytest tests/ -v
pytest tests/ -v --cov=md_to_docx --cov-fail-under=83
# or all Python CI gates (+ optional CI test-job smoke):
./scripts/ci_local.sh
./scripts/ci_local.sh --integration
```

`lxml` is a runtime dependency. Mermaid rendering needs `mmdc` on PATH; the main CI job does not require it (diagrams are optional unless `--strict-mermaid`).

## Dependency audit

```bash
pip install -e ".[dev,mcp,web]"
pip-audit
```

## Python API

```python
from pathlib import Path
from md_to_docx.api import convert, validate_markdown

result = convert(
    source=Path("report.md"),
    output=Path("report.docx"),
    preset="technical",
)
print(result.output_path, result.warnings)

# Or from text:
result = convert(markdown_text="# Hello\n\nWorld.", preset="professional")

issues = validate_markdown("# Title\n\n")
```

`convert()` accepts a file path or `markdown_text=`, optional `preset` / `template`, TOC and metadata flags. See `scripts/md_to_docx/api.py`.

## Rebuild templates

When changing fonts, heading sizes, or table borders:

```bash
md-to-docx build presets
# or:
python3 -m md_to_docx.presets_build
```

Regenerates `assets/presets/*.docx` and `assets/reference-native.docx`.

## Project layout

```
md-to-docx/
├── SKILL.md
├── scripts/md_to_docx/   # Python package
├── assets/               # Bundled conversion assets
├── references/           # Detailed docs (loaded on demand)
└── tests/
```

## Conversion pipeline

```
.md → content normalize → layout spacing → Document AST → native DOCX renderer → .docx
```

Content normalization fixes tables (separator row, column count), list spacing, heading levels, unclosed code blocks, inline formatting, and similar issues before parsing.

Optional Mermaid blocks are rendered to PNG via `mmdc` when available (native media under `{stem}-media/`). Scale/width: `MD_TO_DOCX_MERMAID_SCALE`, `MD_TO_DOCX_MERMAID_WIDTH`.

## Contributing

1. Edit code under `scripts/md_to_docx/`
2. Add or update tests in `tests/`
3. Run `pytest tests/ -v`
4. Update `CHANGELOG.md` for user-visible changes

## OSS / engineering baseline

This repo targets a maintainable, contributable, publishable open-source baseline:

| Area | Evidence |
|------|----------|
| Community health | `LICENSE`, `README` (+zh), `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `SUPPORT`, `CHANGELOG` |
| Contribution UX | Issue/PR templates, `blank_issues_enabled: false`, contact links |
| Quality gates | CI: pre-commit, Ruff (incl. bugbear), progressive mypy (~38 modules), pytest + ≥83% branch coverage, `pip-audit` |
| Local DX | `.editorconfig`, `.pre-commit-config.yaml`, `./scripts/ci_local.sh --all` mirrors all CI jobs, `pip install -e ".[dev,…]"` |
| Supply chain | Dependabot (pip / Actions / browser-extension + VS Code npm groups), clean-venv audit job |
| Packaging | Hatch/`pyproject.toml`, `py.typed`, sdist ships community docs, `release.yml` |
| Ops hygiene | CI `permissions: contents: read`, concurrency cancel, pip/npm caches |

Release steps: [release.md](release.md).

### Map CI jobs → `ci_local.sh`

| GitHub Actions job | Local command |
|--------------------|---------------|
| `pre-commit` + `lint` | default (pre-commit hooks, Ruff on `scripts/md_to_docx` + `tests`) |
| `typecheck` | default (`mypy`) |
| `test` (3.12 + coverage) | default (`pytest --cov-fail-under=83`) |
| `test` (3.10 / 3.11 matrix) | `--matrix` or `--all` |
| `test` (CLI/examples/templates) | `--integration` or `--all` |
| `audit` | `--audit` or `--all` |
| `extension` | `--extension` or `--all` |
| `mermaid` | `--mermaid` or `--all` (skips if `mmdc` missing) |
