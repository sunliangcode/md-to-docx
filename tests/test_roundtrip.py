"""Roundtrip integration tests."""

from __future__ import annotations

from pathlib import Path

import pytest

from md_to_docx.ast import nodes as n
from md_to_docx.diff.ast_diff import diff_documents
from md_to_docx.engine.native import NativeOptions, convert_native
from md_to_docx.load import load_document
from md_to_docx.parse.markdown import parse_markdown
from md_to_docx.paths import native_reference_doc
from md_to_docx.reverse import reverse_docx


@pytest.fixture
def roundtrip_paths(tmp_path: Path) -> tuple[Path, Path]:
    md = Path("tests/fixtures/sample.md")
    docx = tmp_path / "sample.docx"
    back = tmp_path / "back.md"
    convert_native(
        md,
        docx,
        options=NativeOptions(template_path=native_reference_doc()),
    )
    reverse_docx(docx, back)
    return md, back


def test_roundtrip_diff_minimal(roundtrip_paths: tuple[Path, Path]) -> None:
    original, back = roundtrip_paths
    doc_a = load_document(original)
    doc_b = load_document(back)
    changes = diff_documents(doc_a, doc_b)
    # Allow small structural noise, but not wholesale rewrite.
    assert len(changes) <= 5, [c.summary for c in changes]


def test_roundtrip_preserves_bold(roundtrip_paths: tuple[Path, Path]) -> None:
    _original, back = roundtrip_paths
    doc = parse_markdown(back.read_text(encoding="utf-8"))
    paras = [b for b in doc.blocks if isinstance(b, n.Paragraph)]
    assert any(
        isinstance(c, n.Strong) for p in paras for c in p.children
    ), "roundtrip lost bold formatting"
