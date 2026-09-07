"""Markdown parser tests."""

from pathlib import Path

from md_to_docx.ast import nodes as n
from md_to_docx.parse.markdown import parse_markdown

FIXTURES = Path(__file__).parent / "fixtures"


def test_h1():
    doc = parse_markdown("# H1\n")
    assert len(doc.blocks) == 1
    assert isinstance(doc.blocks[0], n.Heading)
    assert doc.blocks[0].level == 1


def test_paragraph_bold_code():
    doc = parse_markdown("**bold** and `code`\n")
    p = doc.blocks[0]
    assert isinstance(p, n.Paragraph)
    types = [type(c) for c in p.children]
    assert n.Strong in types
    assert n.Code in types
    strong = next(c for c in p.children if isinstance(c, n.Strong))
    assert strong.children == (n.Text("bold"),)
    code = next(c for c in p.children if isinstance(c, n.Code))
    assert code.value == "code"


def test_paragraph_link_and_emphasis():
    doc = parse_markdown("Hello *world* and [link](https://example.com).\n")
    p = doc.blocks[0]
    assert isinstance(p, n.Paragraph)
    assert any(isinstance(c, n.Emphasis) for c in p.children)
    link = next(c for c in p.children if isinstance(c, n.Link))
    assert link.href == "https://example.com"
    assert link.children == (n.Text("link"),)


def test_table():
    md = "| A | B |\n|---|---|\n| 1 | 2 |\n"
    doc = parse_markdown(md)
    assert isinstance(doc.blocks[0], n.Table)
    assert len(doc.blocks[0].rows) == 2


def test_code_fence():
    doc = parse_markdown("```python\nx=1\n```\n")
    assert isinstance(doc.blocks[0], n.CodeBlock)
    assert doc.blocks[0].lang == "python"


def test_blockquote():
    doc = parse_markdown("> quote\n")
    assert isinstance(doc.blocks[0], n.BlockQuote)


def test_pagebreak():
    doc = parse_markdown("<!-- pagebreak -->\n")
    assert isinstance(doc.blocks[0], n.PageBreak)


def test_task_list():
    doc = parse_markdown("- [x] done\n- [ ] todo\n")
    assert isinstance(doc.blocks[0], n.ListBlock)
    items = doc.blocks[0].items
    assert items[0].checked is True
    assert items[1].checked is False


def test_chinese():
    doc = parse_markdown("# 中文标题\n\n段落。\n")
    assert isinstance(doc.blocks[0], n.Heading)


def test_mermaid_node():
    doc = parse_markdown("```mermaid\nflowchart LR\n  A-->B\n```\n")
    assert isinstance(doc.blocks[0], n.Mermaid)


def test_empty():
    doc = parse_markdown("")
    assert doc.blocks == ()


def test_footnotes_fixture():
    doc = parse_markdown((FIXTURES / "footnotes.md").read_text(encoding="utf-8"))
    assert doc.footnotes
    assert doc.footnotes[0].key == "note"
    refs = [
        c
        for b in doc.blocks
        if isinstance(b, n.Paragraph)
        for c in b.children
        if isinstance(c, n.FootnoteRef)
    ]
    assert refs and refs[0].key == "note"
    fn_para = doc.footnotes[0].children[0]
    assert isinstance(fn_para, n.Paragraph)
    assert any(isinstance(c, n.Strong) for c in fn_para.children)


def test_captions_and_xrefs_fixture():
    doc = parse_markdown((FIXTURES / "captions.md").read_text(encoding="utf-8"))
    images = [b for b in doc.blocks if isinstance(b, n.Image)]
    assert images and images[0].identifier == "fig:arch"
    tables = [b for b in doc.blocks if isinstance(b, n.Table)]
    assert tables and tables[0].caption == "API endpoints"
    assert tables[0].identifier == "tbl:api"
    xrefs = [
        c
        for b in doc.blocks
        if isinstance(b, n.Paragraph)
        for c in b.children
        if isinstance(c, n.CrossRef)
    ]
    kinds = {(c.kind, c.identifier) for c in xrefs}
    assert ("fig", "arch") in kinds
    assert ("tbl", "api") in kinds
