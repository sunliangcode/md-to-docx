"""Load DOCX templates."""

from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.document import Document as DocxDocument
from docx.oxml.ns import qn

from md_to_docx.paths import native_reference_doc


def clear_body(doc: DocxDocument) -> None:
    body = doc.element.body
    children = list(body)
    for child in children:
        if child.tag != qn("w:sectPr"):
            body.remove(child)


def open_document(template_path: Path | None) -> DocxDocument:
    path = template_path or native_reference_doc()
    doc = Document(str(path))
    clear_body(doc)
    return doc
