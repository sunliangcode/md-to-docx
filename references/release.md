# Release checklist

Do not tag until all items pass.

## Quality gates

1. `pip install -e ".[dev,mcp,web]"`
2. `ruff check scripts/md_to_docx tests && ruff format --check scripts/md_to_docx tests`
3. `mypy`
4. `pytest tests/ -v --cov=md_to_docx --cov-fail-under=83`
5. `python -m venv /tmp/md2docx-audit && /tmp/md2docx-audit/bin/pip install -U pip setuptools wheel && /tmp/md2docx-audit/bin/pip install -e ".[dev,mcp,web]" && /tmp/md2docx-audit/bin/pip-audit`
6. `bash scripts/demo/build_examples.sh` — example docx regenerated
7. `python -m md_to_docx.presets_build` — templates committed when styles change

## Version & notes

8. Bump version in `pyproject.toml` and `scripts/md_to_docx/__init__.py`
9. `CHANGELOG.md` — move `[Unreleased]` notes under a dated `[x.y.z]` section
10. Confirm sdist includes community docs (`LICENSE`, `CHANGELOG`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `SUPPORT`)

## Tag & publish

11. User runs (when ready):

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

GitHub Actions `release.yml` will run tests, build wheel/sdist, and attach to the Release.

Smoke the built artifacts:

```bash
python -m build
python -m venv /tmp/md2docx-wheel
/tmp/md2docx-wheel/bin/pip install dist/*.whl
/tmp/md2docx-wheel/bin/md-to-docx --help
```

## PyPI (`md2docx-compiler`)

Optional automatic upload: set repository secret `PYPI_API_TOKEN` (PyPI API token).
When unset, the release job skips upload and only attaches artifacts to GitHub Releases.

Manual upload:

```bash
pip install build twine
python -m build
twine upload dist/*
```

Package name: **`md2docx-compiler`** · CLI entry point: **`md-to-docx`**.

Until the first PyPI publish, install with:

```bash
pip install "git+https://github.com/sunliang11/md-to-docx.git"
# or editable:
pip install -e ".[dev]"
```
