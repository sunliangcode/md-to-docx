"""Concurrency and apply_preset regression tests."""

from __future__ import annotations

import concurrent.futures
import shutil
from pathlib import Path

from md_to_docx.api import ConvertOptions, apply_preset
from md_to_docx.converter import convert_file


def test_apply_preset_preserves_custom_labels():
    opts = ConvertOptions(
        figure_label="图",
        table_label="表",
        toc_title="目录",
    )
    apply_preset("technical", opts)
    assert opts.figure_label == "图"
    assert opts.table_label == "表"
    assert opts.toc_title == "目录"


def test_apply_preset_fills_default_labels():
    opts = ConvertOptions()
    apply_preset("technical", opts)
    # technical preset should set non-empty toc_title / labels from preset file
    assert opts.toc is True
    assert opts.figure_label  # filled from preset or kept default
    assert opts.table_label


def test_concurrent_footnote_converts(tmp_path: Path):
    src = Path(__file__).parent / "fixtures" / "footnotes.md"

    def _one(i: int) -> Path:
        work = tmp_path / f"w{i}"
        work.mkdir()
        md = work / "footnotes.md"
        shutil.copy(src, md)
        out = work / "out.docx"
        convert_file(md, out)
        return out

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        outs = list(pool.map(_one, range(8)))

    for out in outs:
        assert out.is_file() and out.stat().st_size > 500
        import zipfile

        with zipfile.ZipFile(out) as zf:
            assert "word/footnotes.xml" in zf.namelist()
            xml = zf.read("word/footnotes.xml").decode("utf-8")
            assert "footnote text" in xml
