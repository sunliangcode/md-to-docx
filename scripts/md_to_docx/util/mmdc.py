"""Mermaid CLI wrapper."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from md_to_docx.util.browser import find_browser_executable

DEFAULT_MERMAID_SCALE = 4.0


def resolve_mermaid_scale() -> float:
    raw = os.environ.get("MD_TO_DOCX_MERMAID_SCALE")
    if raw is None or raw.strip() == "":
        return DEFAULT_MERMAID_SCALE
    try:
        scale = float(raw)
    except ValueError:
        print(
            f"warning: invalid MD_TO_DOCX_MERMAID_SCALE={raw!r}; "
            f"using default {DEFAULT_MERMAID_SCALE}",
            file=sys.stderr,
        )
        return DEFAULT_MERMAID_SCALE
    if scale <= 0:
        print(
            f"warning: MD_TO_DOCX_MERMAID_SCALE must be > 0 (got {scale}); "
            f"using default {DEFAULT_MERMAID_SCALE}",
            file=sys.stderr,
        )
        return DEFAULT_MERMAID_SCALE
    return scale


def resolve_mermaid_width() -> int | None:
    raw = os.environ.get("MD_TO_DOCX_MERMAID_WIDTH")
    if raw is None or raw.strip() == "":
        return None
    try:
        width = int(raw)
    except ValueError:
        print(
            f"warning: invalid MD_TO_DOCX_MERMAID_WIDTH={raw!r}; ignoring",
            file=sys.stderr,
        )
        return None
    if width <= 0:
        print(
            f"warning: MD_TO_DOCX_MERMAID_WIDTH must be > 0 (got {width}); ignoring",
            file=sys.stderr,
        )
        return None
    return width


def render_mermaid_to_files(
    source: str,
    out_svg: Path | None,
    *,
    png: Path | None = None,
    scale: float | None = None,
    width: int | None = None,
    browser: str | None = None,
) -> None:
    """Render Mermaid source with a single ``mmdc`` invocation when possible.

    Prefer PNG (embedded in DOCX). SVG is written only when ``out_svg`` is set
    and ``png`` is None; when both are requested, PNG is rendered once and SVG
    is skipped to avoid a second subprocess (set ``MD_TO_DOCX_MERMAID_SVG=1``
    to also emit SVG via a second call).
    """
    mmdc = shutil.which("mmdc")
    if not mmdc:
        raise RuntimeError("`mmdc` not found on PATH")

    scale = resolve_mermaid_scale() if scale is None else scale
    if width is None:
        width = resolve_mermaid_width()
    browser = browser or find_browser_executable()

    if png is None and out_svg is None:
        raise ValueError("render_mermaid_to_files requires png or out_svg")

    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "diagram.mmd"
        src.write_text(source, encoding="utf-8")
        cfg = Path(tmp) / "puppeteer.json"
        if browser:
            cfg.write_text(json.dumps({"executablePath": browser}), encoding="utf-8")

        def _cmd(out: Path) -> list[str]:
            cmd = [mmdc, "-i", str(src), "-o", str(out), "-b", "white", "-s", str(scale)]
            if width is not None:
                cmd.extend(["-w", str(width)])
            if cfg.exists():
                cmd.extend(["-p", str(cfg)])
            return cmd

        primary = png if png is not None else out_svg
        assert primary is not None
        primary.parent.mkdir(parents=True, exist_ok=True)
        result = subprocess.run(_cmd(primary), capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(result.stderr or result.stdout or "mmdc failed")

        want_svg = out_svg is not None and (
            png is None or os.environ.get("MD_TO_DOCX_MERMAID_SVG", "").strip() in ("1", "true", "yes")
        )
        if want_svg and out_svg is not None and out_svg != primary:
            out_svg.parent.mkdir(parents=True, exist_ok=True)
            result2 = subprocess.run(_cmd(out_svg), capture_output=True, text=True)
            if result2.returncode != 0:
                raise RuntimeError(result2.stderr or "mmdc svg failed")
