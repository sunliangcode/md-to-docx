"""In-process CLI tests (cover cli.py; subprocess tests alone miss coverage)."""

from __future__ import annotations

import shutil
from pathlib import Path

from md_to_docx.cli import main, resolve_output_docx


def test_resolve_output_docx_default():
    md = Path("/tmp/docs/a.md")
    assert resolve_output_docx(md, None, None) == Path("/tmp/docs/a.docx")


def test_resolve_output_docx_with_scan_root(tmp_path: Path):
    root = tmp_path / "docs"
    nested = root / "nested"
    nested.mkdir(parents=True)
    md = nested / "a.md"
    md.write_text("# A", encoding="utf-8")
    out_dir = tmp_path / "out"
    assert resolve_output_docx(md, out_dir, root) == out_dir / "nested" / "a.docx"


def test_resolve_output_docx_outside_scan_root(tmp_path: Path):
    md = tmp_path / "other" / "a.md"
    md.parent.mkdir()
    md.write_text("# A", encoding="utf-8")
    out_dir = tmp_path / "out"
    assert resolve_output_docx(md, out_dir, tmp_path / "docs") == out_dir / "a.docx"


def test_main_check_text(tmp_path: Path, capsys):
    md = tmp_path / "ok.md"
    md.write_text("# Title\n\nHello.\n", encoding="utf-8")
    assert main(["--check", str(md)]) == 0
    out = capsys.readouterr().out
    assert "summary:" in out


def test_main_check_json(tmp_path: Path, capsys):
    md = tmp_path / "ok.md"
    md.write_text("# Title\n\nHello.\n", encoding="utf-8")
    assert main(["--check", "--check-format", "json", str(md)]) == 0
    out = capsys.readouterr().out
    assert out.strip().startswith("[")


def test_main_check_requires_path():
    assert main(["--check"]) == 2


def test_main_convert_dry_run(tmp_path: Path, capsys):
    md = tmp_path / "a.md"
    md.write_text("# A\n", encoding="utf-8")
    assert main(["convert", str(md), "--dry-run"]) == 0
    assert "would convert" in capsys.readouterr().out


def test_main_convert_with_preset(tmp_path: Path):
    sample = Path(__file__).parent / "fixtures" / "sample.md"
    md = tmp_path / "sample.md"
    shutil.copy(sample, md)
    assert main([str(md), "--preset", "technical"]) == 0
    assert md.with_suffix(".docx").is_file()


def test_main_reverse_and_diff(tmp_path: Path):
    sample = Path(__file__).parent / "fixtures" / "sample.md"
    a = tmp_path / "a.md"
    shutil.copy(sample, a)
    assert main([str(a)]) == 0
    docx = a.with_suffix(".docx")
    back = tmp_path / "back.md"
    assert main(["reverse", str(docx), "-o", str(back)]) == 0
    assert back.is_file()
    b = tmp_path / "b.md"
    shutil.copy(sample, b)
    assert main(["diff", str(a), str(b)]) == 0


def test_main_diff_missing_file(tmp_path: Path):
    a = tmp_path / "a.md"
    a.write_text("# A\n", encoding="utf-8")
    assert main(["diff", str(a), str(tmp_path / "missing.md")]) == 2
