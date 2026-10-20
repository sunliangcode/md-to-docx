"""Experimental HTML renderer tests."""

from __future__ import annotations

from md_to_docx.ast import nodes as n
from md_to_docx.parse.markdown import parse_markdown
from md_to_docx.render.html import render_html


def test_render_heading():
    doc = parse_markdown("# Hello\n")
    html_out = render_html(doc)
    assert "<h1>Hello</h1>" in html_out


def test_render_callout():
    doc = parse_markdown(":::warning\nBe careful.\n:::\n")
    html_out = render_html(doc)
    assert 'class="callout callout-warning"' in html_out
    assert "Be careful." in html_out


def test_render_pagebreak():
    doc = parse_markdown("<!-- pagebreak -->\n")
    html_out = render_html(doc)
    assert 'class="pagebreak"' in html_out


def test_render_table():
    doc = parse_markdown("| A | B |\n|---|---|\n| 1 | 2 |\n")
    html_out = render_html(doc)
    assert "<table>" in html_out
    assert "<td>1</td>" in html_out


def test_render_inline_formatting_and_links():
    doc = parse_markdown(
        "Text **bold** *em* ~~strike~~ `code` [link](https://ex.com) "
        "![alt](img.png) $E=mc^2$ line  \nbreak\n"
    )
    html_out = render_html(doc)
    assert "<strong>bold</strong>" in html_out
    assert "<em>em</em>" in html_out
    assert "<del>strike</del>" in html_out
    assert "<code>code</code>" in html_out
    assert 'href="https://ex.com"' in html_out
    assert 'src="img.png"' in html_out
    assert 'class="math"' in html_out
    assert "<br>" in html_out


def test_render_lists_code_quote_hr():
    md = (
        "1. one\n2. two\n\n"
        "- bullet\n\n"
        "```py\nprint(1)\n```\n\n"
        "> quote\n\n"
        "---\n"
    )
    html_out = render_html(parse_markdown(md))
    assert "<ol>" in html_out and "<ul>" in html_out
    assert 'class="language-py"' in html_out
    assert "<blockquote>" in html_out
    assert "<hr>" in html_out


def test_render_math_block_and_mermaid():
    md = "$$\n\\frac{a}{b}\n$$\n\n```mermaid\ngraph TD; A-->B;\n```\n"
    html_out = render_html(parse_markdown(md))
    assert 'class="math-block"' in html_out
    assert 'class="mermaid"' in html_out


def test_render_image_figure_toc_html_block_and_title():
    doc = n.Document(
        metadata=n.Metadata(title="Titled"),
        blocks=(
            n.Image(src="a.png", alt="A"),
            n.Figure(
                image=n.Image(src="b.png", alt="B"),
                caption="Cap",
                identifier="fig1",
            ),
            n.Figure(
                image=n.Mermaid(source="graph TD; A-->B;"),
                caption="Flow",
                identifier="fig2",
            ),
            n.TableOfContents(title="Contents"),
            n.HTMLBlock(raw="<div>raw</div>"),
            n.Heading(1, (n.Text("Anchored"),), anchor="sec-1"),
            n.Paragraph(
                (
                    n.FootnoteRef(key="1"),
                    n.CrossRef(kind="fig", identifier="fig1"),
                    n.SoftBreak(),
                    n.Text("end"),
                )
            ),
            n.Table(
                rows=(
                    (
                        n.TableCell(children=(n.Paragraph((n.Text("H"),)),), header=True),
                    ),
                ),
                caption="Tbl",
            ),
        ),
    )
    html_out = render_html(doc)
    assert "<title>Titled</title>" in html_out
    assert 'src="a.png"' in html_out
    assert "<figure>" in html_out and "<figcaption>Cap</figcaption>" in html_out
    assert 'class="mermaid"' in html_out
    assert 'class="toc"' in html_out
    assert "<!-- raw:" in html_out
    assert 'id="sec-1"' in html_out
    assert "#fn-1" in html_out
    assert "[@fig:fig1]" in html_out
    assert 'class="caption"' in html_out


def test_render_nested_list_non_paragraph():
    doc = n.Document(
        metadata=n.Metadata(),
        blocks=(
            n.ListBlock(
                ordered=False,
                items=(
                    n.ListItem(
                        children=(
                            n.Paragraph((n.Text("top"),)),
                            n.CodeBlock(text="x=1", lang="py"),
                        )
                    ),
                ),
            ),
        ),
    )
    html_out = render_html(doc)
    assert "<li>" in html_out
    assert 'class="language-py"' in html_out
