"""Footnote rendering — numbered superscripts + end-of-document notes.

True Word ``word/footnotes.xml`` relationships are not emitted yet; refs are
superscript numbers that match a trailing Notes section. This keeps documents
readable and round-trippable without crashing.
"""

from __future__ import annotations

from docx.text.paragraph import Paragraph

_footnote_order: list[str] = []
_key_to_num: dict[str, int] = {}


def reset_footnote_state() -> None:
    global _footnote_order, _key_to_num
    _footnote_order = []
    _key_to_num = {}


def add_footnote_ref(paragraph: Paragraph, key: str) -> int:
    """Add a superscript footnote marker; returns 1-based note number."""
    global _footnote_order, _key_to_num
    key = str(key)
    if key not in _key_to_num:
        _footnote_order.append(key)
        _key_to_num[key] = len(_footnote_order)
    num = _key_to_num[key]
    run = paragraph.add_run(str(num))
    run.font.superscript = True
    return num


def footnote_keys_in_order() -> list[str]:
    return list(_footnote_order)


def ensure_footnotes_part(doc) -> None:
    """No-op: we render notes inline at document end instead of footnotes.xml."""
    return None
