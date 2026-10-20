# Contributing

Thanks for helping improve md-to-docx.

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Project layout

```
md-to-docx/
├── SKILL.md              # Agent entry point
├── bin/convert           # No-pip wrapper (sets PYTHONPATH)
├── scripts/md_to_docx/   # Python package
├── assets/               # Bundled templates, branding, demo
├── examples/             # Curated conversion examples
├── action/               # GitHub Action
├── web/                  # FastAPI playground
├── editors/              # VS Code / Obsidian
├── browser-extension/    # Browser export extension
├── references/           # Detailed docs
└── tests/
```

## Scope

Contributions are welcome across the shipped product surface:

- CLI / native Document AST engine / presets
- Python API, MCP server, Web Playground
- GitHub Action, editor integrations, browser extension
- Docs, examples, community templates under `templates/`

Historical planning notes live under [`aim/HISTORY.md`](aim/HISTORY.md) (archived — not the active roadmap). See [references/roadmap.md](references/roadmap.md).

## Setup

Requires **Python 3.10+**.

**Skill checkout (no pip):**

```bash
./bin/convert --help
pytest tests/ -v   # may need: pip install -e ".[dev]"
```

**Editable install:**

```bash
pip install -e ".[dev,mcp,web]"
python -m md_to_docx --help
```

## Making changes

1. Edit code under `scripts/md_to_docx/`
2. Add or update tests in `tests/`
3. Run lint and tests locally (see below)
4. Update `CHANGELOG.md` for user-visible changes
5. Open a PR using the template; keep changes focused and reviewable

## Lint

We use [Ruff](https://docs.astral.sh/ruff/) (configured in `pyproject.toml`):

```bash
pip install -e ".[dev]"
ruff check scripts/md_to_docx tests
ruff format scripts/md_to_docx tests
```

Optional local hooks (same checks as CI lint):

```bash
pre-commit install
pre-commit run --all-files
```

CI runs `ruff check` and `ruff format --check` on every PR.

## Type check (progressive)

Public surface modules are checked with mypy (see `[tool.mypy]` in `pyproject.toml`):

```bash
mypy
```

## Tests

```bash
pytest tests/ -v
```

With coverage gate (CI enforces branch coverage ≥83% on Python 3.12):

```bash
pytest tests/ -v --cov=md_to_docx --cov-report=term-missing:skip-covered --cov-fail-under=83
```

`lxml` is a runtime dependency (used for DOCX XML assertions).

Mermaid diagrams need `mmdc` on PATH. The main CI test job does **not** require Mermaid CLI; a separate optional job runs `@pytest.mark.mermaid` when `mmdc` is installed. Diagram rendering is optional unless you pass `--strict-mermaid`.

## Pull requests

- Prefer small PRs with a clear summary and test plan
- Do not commit secrets, `.env`, or local IDE-only paths
- Link related issues when applicable
- Security reports go through [SECURITY.md](SECURITY.md), not public issues

## Rebuild templates

When changing Word styles:

```bash
md-to-docx build presets
# or: PYTHONPATH=scripts python3 -m md_to_docx.presets_build
```

Regenerates `assets/presets/*.docx` and `assets/reference-native.docx`.
