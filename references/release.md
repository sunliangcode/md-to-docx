# Release checklist

Do not tag until all items pass.

1. `pip install -e ".[dev,mcp,web]" && pytest tests/ -v` — all green
2. `bash scripts/demo/build_examples.sh` — example docx regenerated
3. `python -m md_to_docx.presets_build` — templates committed
4. Bump version in `pyproject.toml` and `scripts/md_to_docx/__init__.py`
5. `CHANGELOG.md` — move `[Unreleased]` notes under a dated `[x.y.z]` section
6. User runs (when ready):

```bash
git tag v1.1.1
git push origin v1.1.1
```

GitHub Actions `release.yml` will run tests, build wheel/sdist, and attach to the Release.

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
