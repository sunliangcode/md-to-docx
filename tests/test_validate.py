"""Validation tests."""

from __future__ import annotations

from pathlib import Path

from md_to_docx.ast import nodes as n
from md_to_docx.validate import Issue, validate_document, validate_file


def test_validate_comprehensive():
    path = Path(__file__).parent / "fixtures" / "comprehensive.md"
    issues = validate_file(path)
    assert isinstance(issues, list)


def test_validate_empty(tmp_path: Path):
    p = tmp_path / "empty.md"
    p.write_text("", encoding="utf-8")
    issues = validate_file(p)
    assert any(i.code == "empty_document" for i in issues)


def test_validate_heading_skip():
    doc = n.Document(
        blocks=(
            n.Heading(1, (n.Text("A"),)),
            n.Heading(3, (n.Text("B"),)),
        )
    )
    issues = validate_document(doc, base_dir=Path("."))
    assert any(i.code == "heading_skip" for i in issues)


def test_validate_missing_image(tmp_path: Path):
    doc = n.Document(
        blocks=(n.Image(src="missing.png", alt="x", identifier="fig:1"),),
    )
    issues = validate_document(doc, base_dir=tmp_path)
    assert any(i.code == "missing_image" for i in issues)


def test_validate_unresolved_footnote_and_xrefs():
    doc = n.Document(
        blocks=(
            n.Heading(1, (n.Text("Sec"),), anchor="intro"),
            n.Paragraph(
                (
                    n.FootnoteRef("missing"),
                    n.CrossRef("fig", "nope"),
                    n.CrossRef("tbl", "nope"),
                    n.CrossRef("sec", "missing-sec"),
                    n.Strong((n.CrossRef("fig", "also-missing"),)),
                )
            ),
            n.Table(
                rows=((n.TableCell(children=(n.Paragraph((n.Text("a"),)),), header=True),),),
                identifier="tbl:real",
            ),
        ),
        footnotes=(),
    )
    issues = validate_document(doc, base_dir=Path("."))
    codes = {i.code for i in issues}
    assert "unresolved_footnote" in codes
    assert "unresolved_xref" in codes


def test_validate_resolved_xrefs_and_existing_image(tmp_path: Path):
    img = tmp_path / "ok.png"
    img.write_bytes(b"\x89PNG\r\n\x1a\n")
    doc = n.Document(
        blocks=(
            n.Heading(1, (n.Text("Sec"),), anchor="intro"),
            n.Image(src="ok.png", alt="x", identifier="fig:one"),
            n.Table(
                rows=((n.TableCell(children=(n.Paragraph((n.Text("a"),)),), header=True),),),
                identifier="tbl:one",
            ),
            n.Paragraph(
                (
                    n.CrossRef("fig", "one"),
                    n.CrossRef("tbl", "one"),
                    n.CrossRef("sec", "intro"),
                    n.FootnoteRef("1"),
                )
            ),
        ),
        footnotes=(n.FootnoteDef(key="1", children=(n.Paragraph((n.Text("n"),)),)),),
    )
    issues = validate_document(doc, base_dir=tmp_path)
    assert not any(i.severity == "error" for i in issues)


def test_validate_mermaid_warning_without_mmdc(monkeypatch):
    monkeypatch.setattr("md_to_docx.validate.shutil.which", lambda _cmd: None)
    doc = n.Document(blocks=(n.Mermaid(source="graph TD; A-->B;"),))
    issues = validate_document(doc, base_dir=Path("."))
    assert any(i.code == "missing_mermaid_cli" for i in issues)


def test_validate_file_strict_promotes_warnings(tmp_path: Path, monkeypatch):
    monkeypatch.setattr("md_to_docx.validate.shutil.which", lambda _cmd: None)
    md = tmp_path / "m.md"
    md.write_text("# A\n\n```mermaid\ngraph TD; A-->B;\n```\n", encoding="utf-8")
    normal = validate_file(md, strict=False)
    strict = validate_file(md, strict=True)
    assert any(i.code == "missing_mermaid_cli" and i.severity == "warning" for i in normal)
    assert any(i.code == "missing_mermaid_cli" and i.severity == "error" for i in strict)


def test_issue_fields():
    issue = Issue("warning", "x", "msg", line=3)
    assert issue.severity == "warning"
    assert issue.line == 3
