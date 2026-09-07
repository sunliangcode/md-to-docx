"""Footnote rendering — true Word ``word/footnotes.xml`` + footnoteReference.

Each ``DocxRenderer`` owns a ``FootnoteState`` so concurrent converts do not
share mutable module globals.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from docx.document import Document as DocxDocument
from docx.opc.constants import CONTENT_TYPE as CT
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.opc.packuri import PackURI
from docx.opc.part import Part
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from lxml import etree

from md_to_docx.ast import nodes as n

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"


@dataclass
class FootnoteState:
    """Per-render footnote numbering and reference tracking."""

    order: list[str] = field(default_factory=list)
    key_to_id: dict[str, int] = field(default_factory=dict)

    def add_ref(self, paragraph: Paragraph, key: str) -> int:
        """Insert a Word footnoteReference; returns 1-based footnote id."""
        key = str(key)
        if key not in self.key_to_id:
            self.order.append(key)
            self.key_to_id[key] = len(self.order)
        fid = self.key_to_id[key]
        _insert_footnote_reference(paragraph, fid)
        return fid

    def keys_in_order(self) -> list[str]:
        return list(self.order)


def _insert_footnote_reference(paragraph: Paragraph, fid: int) -> None:
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    r_style = OxmlElement("w:rStyle")
    r_style.set(qn("w:val"), "FootnoteReference")
    r_pr.append(r_style)
    run.append(r_pr)
    ref = OxmlElement("w:footnoteReference")
    ref.set(qn("w:id"), str(fid))
    run.append(ref)
    paragraph._p.append(run)


def _text_el(value: str):
    t = OxmlElement("w:t")
    if value.startswith(" ") or value.endswith(" ") or "  " in value:
        t.set(f"{{{XML_NS}}}space", "preserve")
    t.text = value
    return t


def _run_with_text(value: str, *, bold: bool = False, italic: bool = False):
    run = OxmlElement("w:r")
    if bold or italic:
        r_pr = OxmlElement("w:rPr")
        if bold:
            r_pr.append(OxmlElement("w:b"))
        if italic:
            r_pr.append(OxmlElement("w:i"))
        run.append(r_pr)
    run.append(_text_el(value))
    return run


def _append_inlines(p_el, children: tuple[n.Inline, ...]) -> None:
    for child in children:
        if isinstance(child, n.Text):
            p_el.append(_run_with_text(child.value))
        elif isinstance(child, n.Strong):
            for sub in child.children:
                if isinstance(sub, n.Text):
                    p_el.append(_run_with_text(sub.value, bold=True))
                else:
                    _append_inlines(p_el, (sub,))
        elif isinstance(child, n.Emphasis):
            for sub in child.children:
                if isinstance(sub, n.Text):
                    p_el.append(_run_with_text(sub.value, italic=True))
                else:
                    _append_inlines(p_el, (sub,))
        elif isinstance(child, n.Code):
            run = OxmlElement("w:r")
            r_pr = OxmlElement("w:rPr")
            fonts = OxmlElement("w:rFonts")
            fonts.set(qn("w:ascii"), "Consolas")
            fonts.set(qn("w:hAnsi"), "Consolas")
            r_pr.append(fonts)
            run.append(r_pr)
            run.append(_text_el(child.value))
            p_el.append(run)
        elif isinstance(child, n.Link):
            text = (
                "".join(c.value for c in child.children if isinstance(c, n.Text))
                or child.href
            )
            p_el.append(_run_with_text(text))
        elif isinstance(child, n.Strike):
            _append_inlines(p_el, child.children)


def _footnote_body_paragraphs(fn: n.FootnoteDef) -> list:
    paragraphs: list = []
    for idx, block in enumerate(fn.children):
        p = OxmlElement("w:p")
        p_pr = OxmlElement("w:pPr")
        p_style = OxmlElement("w:pStyle")
        p_style.set(qn("w:val"), "FootnoteText")
        p_pr.append(p_style)
        p.append(p_pr)
        if idx == 0:
            mark_run = OxmlElement("w:r")
            mark_pr = OxmlElement("w:rPr")
            mark_style = OxmlElement("w:rStyle")
            mark_style.set(qn("w:val"), "FootnoteReference")
            mark_pr.append(mark_style)
            mark_run.append(mark_pr)
            mark_run.append(OxmlElement("w:footnoteRef"))
            p.append(mark_run)
            p.append(_run_with_text(" "))
        if isinstance(block, n.Paragraph):
            _append_inlines(p, block.children)
        else:
            p.append(_run_with_text(str(block)))
        paragraphs.append(p)
    if not paragraphs:
        p = OxmlElement("w:p")
        p_pr = OxmlElement("w:pPr")
        p_style = OxmlElement("w:pStyle")
        p_style.set(qn("w:val"), "FootnoteText")
        p_pr.append(p_style)
        p.append(p_pr)
        mark_run = OxmlElement("w:r")
        mark_pr = OxmlElement("w:rPr")
        mark_style = OxmlElement("w:rStyle")
        mark_style.set(qn("w:val"), "FootnoteReference")
        mark_pr.append(mark_style)
        mark_run.append(mark_pr)
        mark_run.append(OxmlElement("w:footnoteRef"))
        p.append(mark_run)
        paragraphs.append(p)
    return paragraphs


def _separator_footnote(fid: str, ftype: str):
    fn = OxmlElement("w:footnote")
    fn.set(qn("w:type"), ftype)
    fn.set(qn("w:id"), fid)
    p = OxmlElement("w:p")
    p_pr = OxmlElement("w:pPr")
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:after"), "0")
    spacing.set(qn("w:line"), "240")
    spacing.set(qn("w:lineRule"), "auto")
    p_pr.append(spacing)
    p.append(p_pr)
    run = OxmlElement("w:r")
    sep_tag = "w:separator" if ftype == "separator" else "w:continuationSeparator"
    run.append(OxmlElement(sep_tag))
    p.append(run)
    fn.append(p)
    return fn


def build_footnotes_xml(
    state: FootnoteState,
    footnotes: tuple[n.FootnoteDef, ...],
) -> bytes:
    """Serialize footnote definitions to ``word/footnotes.xml`` bytes."""
    by_key = {fn.key: fn for fn in footnotes}
    order = list(state.order)
    for fn in footnotes:
        if fn.key not in order:
            order.append(fn.key)
            state.key_to_id.setdefault(fn.key, len(order))

    # Build with lxml so the default namespace is correct for Word.
    NSMAP = {"w": W_NS}
    root = etree.Element(f"{{{W_NS}}}footnotes", nsmap=NSMAP)
    for sep in (
        _separator_footnote("-1", "separator"),
        _separator_footnote("0", "continuationSeparator"),
    ):
        root.append(sep)

    for key in order:
        fn_def = by_key.get(key)
        if fn_def is None:
            continue
        fid = state.key_to_id[key]
        fn_el = OxmlElement("w:footnote")
        fn_el.set(qn("w:id"), str(fid))
        for p in _footnote_body_paragraphs(fn_def):
            fn_el.append(p)
        root.append(fn_el)

    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def ensure_footnotes_part(
    doc: DocxDocument,
    state: FootnoteState,
    footnotes: tuple[n.FootnoteDef, ...],
) -> None:
    """Attach ``word/footnotes.xml`` to the document package."""
    if not state.order and not footnotes:
        return
    # Ensure unreferenced defs still get ids.
    for fn in footnotes:
        if fn.key not in state.key_to_id:
            state.order.append(fn.key)
            state.key_to_id[fn.key] = len(state.order)

    xml_bytes = build_footnotes_xml(state, footnotes)
    partname = PackURI("/word/footnotes.xml")
    package = doc.part.package

    # Replace existing footnotes relationship if any.
    drop_rids = [
        rel.rId
        for rel in doc.part.rels.values()
        if rel.reltype == RT.FOOTNOTES
    ]
    for rid in drop_rids:
        doc.part.drop_rel(rid)

    footnotes_part = Part(partname, CT.WML_FOOTNOTES, xml_bytes, package)
    doc.part.relate_to(footnotes_part, RT.FOOTNOTES)
