"""Tests for AST → Markdown writer."""

from __future__ import annotations

from pathlib import Path

from md_to_docx.ast import nodes as n
from md_to_docx.parse.markdown import parse_markdown
from md_to_docx.write.markdown import write_markdown


def _block_types(doc: n.Document) -> list[str]:
    return [type(b).__name__ for b in doc.blocks]


def test_write_markdown_roundtrip_block_types() -> None:
    src = Path("tests/fixtures/sample.md").read_text(encoding="utf-8")
    original = parse_markdown(src)
    md = write_markdown(original)
    roundtrip = parse_markdown(md)
    assert _block_types(original) == _block_types(roundtrip)


def test_write_frontmatter_and_inlines() -> None:
    doc = n.Document(
        metadata=n.Metadata(title="T", author="A", date="2026-01-01"),
        blocks=(
            n.Paragraph(
                (
                    n.Text("x"),
                    n.Strong((n.Text("b"),)),
                    n.Emphasis((n.Text("e"),)),
                    n.Strike((n.Text("s"),)),
                    n.Code("c"),
                    n.Link("https://ex.com", (n.Text("L"),)),
                    n.InlineImage("i.png", alt="alt"),
                    n.Break(),
                    n.SoftBreak(),
                    n.MathInline("a+b"),
                    n.FootnoteRef("1"),
                    n.CrossRef("tbl", "t1"),
                )
            ),
        ),
        footnotes=(
            n.FootnoteDef(
                key="1",
                children=(n.Paragraph((n.Text("note"),)),),
            ),
        ),
    )
    md = write_markdown(doc)
    assert md.startswith("---\n")
    assert "title: T" in md
    assert "**b**" in md and "*e*" in md and "~~s~~" in md
    assert "`c`" in md
    assert "[L](https://ex.com)" in md
    assert "![alt](i.png)" in md
    assert "$a+b$" in md
    assert "[^1]" in md and "[@tbl:t1]" in md
    assert "[^1]:" in md and "note" in md


def test_write_blocks_coverage() -> None:
    doc = n.Document(
        metadata=n.Metadata(),
        blocks=(
            n.Heading(2, (n.Text("H"),), anchor="h"),
            n.ListBlock(
                ordered=True,
                start=3,
                items=(n.ListItem(children=(n.Paragraph((n.Text("item"),)),)),),
            ),
            n.ListBlock(
                ordered=False,
                items=(
                    n.ListItem(
                        children=(
                            n.Paragraph((n.Text("nest"),)),
                            n.CodeBlock(text="print(1)", lang="py"),
                        )
                    ),
                ),
            ),
            n.Table(
                rows=(
                    (
                        n.TableCell(children=(n.Paragraph((n.Text("A|B"),)),), header=True),
                        n.TableCell(children=(n.Paragraph((n.Text("C"),)),), header=True),
                    ),
                    (
                        n.TableCell(children=(n.Paragraph((n.Text("1"),)),)),
                        n.TableCell(children=(n.Paragraph((n.Text("2"),)),)),
                    ),
                ),
                caption="Numbers",
                identifier="nums",
            ),
            n.CodeBlock(text="x", lang=""),
            n.Mermaid(source="graph TD; A-->B;"),
            n.MathBlock(latex=r"\frac{a}{b}"),
            n.BlockQuote(children=(n.Paragraph((n.Text("q"),)),)),
            n.BlockQuote(children=(n.CodeBlock(text="inner", lang="txt"),)),
            n.Callout(kind="info", children=(n.Paragraph((n.Text("note"),)),)),
            n.ThematicBreak(),
            n.Image(src="a.png", alt="A", identifier="figa"),
            n.Figure(
                image=n.Image(src="b.png", alt="B"),
                caption="Cap",
                identifier="figb",
            ),
            n.Figure(
                image=n.Mermaid(source="graph LR; X-->Y;"),
                caption="Flow",
                identifier="figc",
            ),
            n.PageBreak(),
            n.TableOfContents(title="TOC"),
            n.HTMLBlock(raw="<hr class='x'>"),
        ),
    )
    md = write_markdown(doc)
    assert "## H {#h}" in md
    assert "3. item" in md
    assert "```py" in md and "print(1)" in md
    assert "A\\|B" in md
    assert "Table: Numbers {#tbl:nums}" in md
    assert "```mermaid" in md
    assert r"$$\frac{a}{b}$$" in md
    assert "> q" in md
    assert ":::info" in md
    assert md.count("---") >= 1
    assert "![A](a.png) {#fig:figa}" in md
    assert "![Cap](b.png) {#fig:figb}" in md
    assert "Figure: Flow {#fig:figc}" in md
    assert "<!-- pagebreak -->" in md
    assert "<!-- toc: TOC -->" in md
    assert "<hr class='x'>" in md
