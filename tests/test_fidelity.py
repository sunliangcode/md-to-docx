"""Expanded roundtrip fidelity checks."""

from __future__ import annotations

from pathlib import Path

from md_to_docx.ast import nodes as n
from md_to_docx.diff.ast_diff import diff_documents
from md_to_docx.engine.native import NativeOptions, convert_native
from md_to_docx.load import load_document
from md_to_docx.parse.markdown import parse_markdown
from md_to_docx.paths import native_reference_doc
from md_to_docx.reverse import reverse_docx


def _roundtrip(md_text: str, tmp_path: Path) -> tuple[n.Document, n.Document]:
    md = tmp_path / "in.md"
    docx = tmp_path / "out.docx"
    back = tmp_path / "back.md"
    md.write_text(md_text, encoding="utf-8")
    convert_native(
        md,
        docx,
        options=NativeOptions(template_path=native_reference_doc()),
    )
    reverse_docx(docx, back)
    return load_document(md), load_document(back)


def test_roundtrip_preserves_table(tmp_path: Path) -> None:
    original, back = _roundtrip(
        "| A | B |\n| --- | --- |\n| 1 | 2 |\n",
        tmp_path,
    )
    assert any(isinstance(b, n.Table) for b in original.blocks)
    assert any(isinstance(b, n.Table) for b in back.blocks)


def test_roundtrip_preserves_list(tmp_path: Path) -> None:
    original, back = _roundtrip("- one\n- two\n", tmp_path)
    assert any(isinstance(b, n.ListBlock) for b in original.blocks)
    assert any(isinstance(b, n.ListBlock) for b in back.blocks)


def test_roundtrip_footnotes_survive(tmp_path: Path) -> None:
    text = Path("tests/fixtures/footnotes.md").read_text(encoding="utf-8")
    original, back = _roundtrip(text, tmp_path)
    assert original.footnotes
    # Reverse from footnotes.xml should recover at least one footnote def.
    assert back.footnotes or any(
        isinstance(c, n.FootnoteRef)
        for b in back.blocks
        if isinstance(b, n.Paragraph)
        for c in b.children
    )


def test_caption_fixture_roundtrip_bounded(tmp_path: Path) -> None:
    text = Path("tests/fixtures/captions.md").read_text(encoding="utf-8")
    original, back = _roundtrip(text, tmp_path)
    changes = diff_documents(original, back)
    assert len(changes) <= 12, [c.summary for c in changes]
