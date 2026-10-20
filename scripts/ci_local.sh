#!/usr/bin/env bash
# Mirror GitHub Actions CI jobs that can run on a single machine.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

run_audit=false
run_integration=false
run_extension=false
run_mermaid=false
run_matrix=false
for arg in "$@"; do
  case "$arg" in
    --audit) run_audit=true ;;
    --integration) run_integration=true ;;
    --extension) run_extension=true ;;
    --mermaid) run_mermaid=true ;;
    --matrix) run_matrix=true ;;
    --all)
      run_audit=true
      run_integration=true
      run_extension=true
      run_mermaid=true
      run_matrix=true
      ;;
    -h | --help)
      cat <<'EOF'
Usage: scripts/ci_local.sh [OPTIONS]

Default: pre-commit, mypy, pytest (coverage floor) — mirrors CI pre-commit + typecheck + test (3.12).

Options (CI job mapping):
  --integration   test job smoke (CLI, examples, templates, editor manifests)
  --audit         audit job (pip-audit in clean venv)
  --extension     extension job (browser-extension npm ci && npm test)
  --mermaid       mermaid job (pytest -m mermaid; skips if mmdc missing)
  --matrix        pytest on python3.10 / 3.11 when installed (test matrix)
  --all           integration + audit + extension + mermaid + py3.10/3.11 matrix

Examples:
  ./scripts/ci_local.sh --all
  ./scripts/ci_local.sh --integration --audit
EOF
      exit 0
      ;;
    *)
      echo "error: unknown option: $arg (try --help)" >&2
      exit 1
      ;;
  esac
done

if ! command -v pre-commit >/dev/null 2>&1; then
  echo "error: pre-commit not found; pip install -e \".[dev]\"" >&2
  exit 1
fi

if ! command -v md-to-docx >/dev/null 2>&1; then
  echo "error: md-to-docx not on PATH; pip install -e \".[dev,mcp,web]\"" >&2
  exit 1
fi

echo "==> pre-commit + lint (CI pre-commit / lint jobs)"
pre-commit run --all-files

echo "==> mypy (CI typecheck job)"
mypy

echo "==> pytest + coverage (CI test job, Python 3.12 cell)"
pytest tests/ -v --cov=md_to_docx --cov-report='term-missing:skip-covered' --cov-fail-under=83

if [[ "$run_matrix" == true ]]; then
  echo "==> pytest matrix (CI test job, other Python versions)"
  for py in python3.10 python3.11; do
    if command -v "$py" >/dev/null 2>&1; then
      echo "--- $py ---"
      "$py" -m pytest tests/ -q
    else
      echo "skip: $py not installed"
    fi
  done
fi

if [[ "$run_integration" == true ]]; then
  echo "==> integration smoke (CI test job extras)"
  md-to-docx mcp --help
  python -m md_to_docx.mcp --help
  ./bin/convert --help
  python -m md_to_docx --version
  python -m md_to_docx --help

  python -m md_to_docx tests/fixtures/sample.md --preset technical
  python -m md_to_docx tests/fixtures/comprehensive.md --preset professional
  test -s tests/fixtures/sample.docx
  test -s tests/fixtures/comprehensive.docx

  bash scripts/demo/build_examples.sh
  for f in examples/*/example.docx; do test -s "$f"; done

  md-to-docx examples/meeting-notes/example.md --preset technical --output-dir dist/docx
  test -s dist/docx/example.docx

  md-to-docx tests/fixtures/sample.md \
    --plugin examples/plugins/uppercase_headings.py \
    --output-dir /tmp/md2docx-plugin-test
  test -s /tmp/md2docx-plugin-test/sample.docx

  for f in templates/*/sample.md; do
    dir=$(dirname "$f")
    name=$(basename "$f" .md)
    md-to-docx "$f" --template "$dir/template.docx" --output-dir /tmp/md2docx-templates-test
    test -s "/tmp/md2docx-templates-test/${name}.docx"
  done

  python -m json.tool editors/vscode/package.json > /dev/null
  python -m json.tool editors/obsidian/manifest.json > /dev/null
fi

if [[ "$run_extension" == true ]]; then
  echo "==> browser extension (CI extension job)"
  if ! command -v npm >/dev/null 2>&1; then
    echo "error: npm required for --extension" >&2
    exit 1
  fi
  (
    cd browser-extension
    npm ci
    npm test
  )
fi

if [[ "$run_mermaid" == true ]]; then
  echo "==> mermaid tests (CI mermaid job)"
  if command -v mmdc >/dev/null 2>&1; then
    pytest tests/ -v -m mermaid
  else
    echo "skip: mmdc not on PATH (install @mermaid-js/mermaid-cli for full parity)"
  fi
fi

if [[ "$run_audit" == true ]]; then
  echo "==> pip-audit (CI audit job)"
  audit_venv="${TMPDIR:-/tmp}/md2docx-audit-$$"
  python -m venv "$audit_venv"
  "$audit_venv/bin/pip" install -U pip setuptools wheel -q
  "$audit_venv/bin/pip" install -e ".[dev,mcp,web]" -q
  "$audit_venv/bin/pip-audit" --progress-spinner off
  rm -rf "$audit_venv"
fi

echo "ci_local: OK"
