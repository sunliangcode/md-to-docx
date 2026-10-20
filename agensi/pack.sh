#!/usr/bin/env bash
# Rebuild agensi/md-to-docx.zip from agensi/md-to-docx/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -f md-to-docx/SKILL.md ]]; then
  echo "error: md-to-docx/SKILL.md missing" >&2
  exit 1
fi

rm -f md-to-docx.zip
# Clean caches inside package before zip
find md-to-docx -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
find md-to-docx -name '*.pyc' -delete 2>/dev/null || true
find md-to-docx -name '.DS_Store' -delete 2>/dev/null || true

zip -r md-to-docx.zip md-to-docx \
  -x "*.DS_Store" \
  -x "*__pycache__*" \
  -x "*.pyc"

echo "Wrote $ROOT/md-to-docx.zip"
unzip -l md-to-docx.zip | head -40
