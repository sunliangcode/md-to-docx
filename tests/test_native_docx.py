"""Native engine DOCX output tests."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

import pytest
from lxml import etree

from md_to_docx.converter import convert_file

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def _xml(docx: Path, name: str):
    with zipfile.ZipFile(docx) as zf:
        with zf.open(name) as f:
            return etree.parse(f).getroot()


def _document_text(docx: Path) -> str:
    root = _xml(docx, "word/document.xml")
    return "".join(root.xpath(".//w:t/text()", namespaces=NS))


@pytest.fixture
def native_sample(tmp_path: Path) -> Path:
    src = Path(__file__).parent / "fixtures" / "sample.md"
    dst = tmp_path / "sample.md"
    shutil.copy(src, dst)
    out = tmp_path / "sample.docx"
    convert_file(dst, out)
    return out


def test_valid_docx(native_sample: Path):
    with zipfile.ZipFile(native_sample) as zf:
        assert "[Content_Types].xml" in zf.namelist()


def test_has_table(native_sample: Path):
    root = _xml(native_sample, "word/document.xml")
    assert root.findall(".//w:tbl", namespaces=NS)


def test_has_heading(native_sample: Path):
    root = _xml(native_sample, "word/document.xml")
    styles = [el.get(f"{{{NS['w']}}}val") for el in root.findall(".//w:pStyle", namespaces=NS)]
    assert any(s and "Heading" in s for s in styles)


def test_yahei_in_styles(native_sample: Path):
    root = _xml(native_sample, "word/styles.xml")
    east = [
        el.get(f"{{{NS['w']}}}eastAsia")
        for el in root.findall(".//w:rFonts", namespaces=NS)
    ]
    assert "Microsoft YaHei" in east


def _heading_color(docx: Path, style_id: str) -> str | None:
    root = _xml(docx, "word/styles.xml")
    for style in root.findall("w:style", namespaces=NS):
        if style.get(f"{{{NS['w']}}}styleId") != style_id:
            continue
        color = style.find(".//w:color", namespaces=NS)
        if color is None:
            return None
        return color.get(f"{{{NS['w']}}}val")
    return None


def test_heading_color_black(native_sample: Path):
    assert _heading_color(native_sample, "Heading1") == "000000"
    assert _heading_color(native_sample, "Heading2") == "000000"


def test_sample_has_bold_run_not_raw_markers(native_sample: Path):
    root = _xml(native_sample, "word/document.xml")
    text = _document_text(native_sample)
    assert "bold" in text
    assert "**bold**" not in text
    assert "`inline code`" not in text
    bolds = root.xpath(".//w:r[w:rPr/w:b]/w:t", namespaces=NS)
    assert any("bold" in (t.text or "") for t in bolds)


def test_footnotes_convert(tmp_path: Path):
    src = Path(__file__).parent / "fixtures" / "footnotes.md"
    dst = tmp_path / "footnotes.md"
    shutil.copy(src, dst)
    out = tmp_path / "footnotes.docx"
    convert_file(dst, out)
    text = _document_text(out)
    assert "footnote reference" in text
    with zipfile.ZipFile(out) as zf:
        assert "word/footnotes.xml" in zf.namelist()
    root = _xml(out, "word/document.xml")
    assert root.findall(".//w:footnoteReference", namespaces=NS)
    fn_text = "".join(_xml(out, "word/footnotes.xml").xpath(".//w:t/text()", namespaces=NS))
    assert "footnote text" in fn_text
    assert "**bold**" not in fn_text
    # Bold should be present as a run, not raw markdown
    assert "bold" in fn_text


def test_captions_convert(tmp_path: Path):
    src = Path(__file__).parent / "fixtures" / "captions.md"
    dst = tmp_path / "captions.md"
    shutil.copy(src, dst)
    out = tmp_path / "captions.docx"
    convert_file(dst, out)
    text = _document_text(out)
    assert "Figure 1" in text or "System architecture" in text
    assert "API endpoints" in text
    assert "[@fig:arch]" not in text
    assert "[@tbl:api]" not in text
