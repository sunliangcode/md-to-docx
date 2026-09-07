"""Markdown-it-py parser."""

from __future__ import annotations

import re
import sys
from pathlib import Path

from markdown_it import MarkdownIt
from markdown_it.token import Token
from mdit_py_plugins.dollarmath import dollarmath_plugin
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin

from md_to_docx.ast import nodes as n
from md_to_docx.parse.frontmatter import parse_frontmatter

PAGEBREAK_COMMENT = re.compile(r"^\s*<!--\s*pagebreak\s*-->\s*$", re.I)
PAGEBREAK_CONTAINER_RE = re.compile(
    r"^:::+\s*pagebreak\s*\n:::+\s*$",
    re.I | re.MULTILINE,
)
CALLOUT_RE = re.compile(
    r"^:::+(warning|info|note)\s*\n(.*?)^:::+\s*$",
    re.I | re.MULTILINE | re.DOTALL,
)
CALLOUT_PLACEHOLDER_RE = re.compile(r"^\s*<!--\s*odm-callout:(\d+)\s*-->\s*$")
FIG_ID_RE = re.compile(r"\{#(fig|tbl):([^}]+)\}\s*$")
XREF_RE = re.compile(r"\[@(fig|tbl|sec):([^\]]+)\]")
TABLE_CAPTION_RE = re.compile(r"^Table:\s*(.+?)(?:\s*\{#tbl:([^}]+)\})?\s*$", re.I)


def _make_md() -> MarkdownIt:
    md = MarkdownIt("gfm-like", {"breaks": False, "html": True, "linkify": False})
    try:
        md.disable("linkify")
    except Exception:
        pass
    md.enable(["table", "strikethrough"])
    md.use(tasklists_plugin)
    md.use(dollarmath_plugin, allow_labels=False)
    md.use(footnote_plugin)
    return md


def _text_with_xrefs(text: str) -> list[n.Inline]:
    """Split plain text into Text / CrossRef nodes via [@fig|tbl|sec:id]."""
    if not text:
        return []
    parts: list[n.Inline] = []
    last = 0
    for match in XREF_RE.finditer(text):
        if match.start() > last:
            parts.append(n.Text(text[last : match.start()]))
        parts.append(n.CrossRef(match.group(1), match.group(2)))  # type: ignore[arg-type]
        last = match.end()
    if last < len(text):
        parts.append(n.Text(text[last:]))
    return parts


def _inline_children(tokens: list[Token], start: int, end: int) -> tuple[n.Inline, ...]:
    children: list[n.Inline] = []
    i = start
    while i < end:
        tok = tokens[i]
        if tok.type == "inline":
            # markdown-it nests emphasis/links/code under inline.children
            nested = list(tok.children or [])
            children.extend(_inline_children(nested, 0, len(nested)))
            i += 1
        elif tok.type == "text":
            children.extend(_text_with_xrefs(tok.content))
            i += 1
        elif tok.type == "code_inline":
            children.append(n.Code(tok.content))
            i += 1
        elif tok.type == "softbreak":
            children.append(n.SoftBreak())
            i += 1
        elif tok.type == "hardbreak":
            children.append(n.Break())
            i += 1
        elif tok.type == "strong_open":
            close = _find_close(tokens, i, "strong_close")
            children.append(n.Strong(_inline_children(tokens, i + 1, close)))
            i = close + 1
        elif tok.type == "em_open":
            close = _find_close(tokens, i, "em_close")
            children.append(n.Emphasis(_inline_children(tokens, i + 1, close)))
            i = close + 1
        elif tok.type == "s_open":
            close = _find_close(tokens, i, "s_close")
            children.append(n.Strike(_inline_children(tokens, i + 1, close)))
            i = close + 1
        elif tok.type == "link_open":
            close = _find_close(tokens, i, "link_close")
            href = tok.attrGet("href") or ""
            title = tok.attrGet("title")
            children.append(
                n.Link(href, _inline_children(tokens, i + 1, close), title=title)
            )
            i = close + 1
        elif tok.type == "image":
            alt = (tok.attrGet("alt") or tok.content or "").strip()
            children.append(
                n.InlineImage(
                    src=tok.attrGet("src") or "",
                    alt=alt,
                    title=tok.attrGet("title"),
                )
            )
            i += 1
        elif tok.type == "math_inline":
            children.append(n.MathInline(tok.content))
            i += 1
        elif tok.type == "footnote_ref":
            key = tok.meta.get("label")
            if key is None:
                key = tok.meta.get("id", tok.content)
            children.append(n.FootnoteRef(str(key)))
            i += 1
        elif tok.type == "html_inline":
            children.extend(_text_with_xrefs(tok.content))
            i += 1
        elif tok.type in ("footnote_anchor",):
            i += 1
        else:
            if tok.content:
                children.extend(_text_with_xrefs(tok.content))
            i += 1
    return tuple(children)


def _find_close(tokens: list[Token], start: int, close_type: str) -> int:
    depth = 0
    open_type = tokens[start].type
    for i in range(start, len(tokens)):
        if tokens[i].type == open_type:
            depth += 1
        elif tokens[i].type == close_type:
            depth -= 1
            if depth == 0:
                return i
    return len(tokens) - 1


def _parse_image_attrs(src: str, alt: str, title: str | None) -> tuple[str, str, str | None, str | None]:
    identifier = None
    m = FIG_ID_RE.search(alt)
    if m:
        identifier = f"{m.group(1)}:{m.group(2)}"
        alt = FIG_ID_RE.sub("", alt).strip()
    if title:
        m2 = FIG_ID_RE.search(title)
        if m2:
            identifier = f"{m2.group(1)}:{m2.group(2)}"
            title = FIG_ID_RE.sub("", title).strip() or None
    return src, alt, title, identifier


def _blocks_from_tokens(
    tokens: list[Token],
    warnings: list[str],
    *,
    callouts: dict[int, tuple[str, tuple[n.Block, ...]]] | None = None,
) -> tuple[n.Block, ...]:
    callout_map = callouts or {}
    blocks: list[n.Block] = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok.type in ("bullet_list_open", "ordered_list_open"):
            ordered = tok.type == "ordered_list_open"
            close = _find_close(tokens, i, "bullet_list_close" if not ordered else "ordered_list_close")
            items = _parse_list_items(tokens, i + 1, close, ordered, callout_map)
            blocks.append(
                n.ListBlock(
                    ordered=ordered,
                    items=tuple(items),
                    start=int(tok.attrGet("start") or 1) if ordered else 1,
                )
            )
            i = close + 1
        elif tok.type == "heading_open":
            level = int(tok.tag[1])
            inline = tokens[i + 1]
            children = _inline_children([inline], 0, 1)
            blocks.append(n.Heading(level=level, children=children))
            i += 3
        elif tok.type == "paragraph_open":
            close = _find_close(tokens, i, "paragraph_close")
            children = _inline_children(tokens, i + 1, close)
            if children:
                blocks.append(n.Paragraph(children))
            i = close + 1
        elif tok.type == "fence":
            lang = (tok.info or "").strip().split()[0] if tok.info else None
            if lang == "mermaid":
                blocks.append(n.Mermaid(tok.content))
            else:
                blocks.append(n.CodeBlock(tok.content.rstrip("\n"), lang=lang or None))
            i += 1
        elif tok.type == "code_block":
            blocks.append(n.CodeBlock(tok.content.rstrip("\n"), lang=None))
            i += 1
        elif tok.type == "blockquote_open":
            close = _find_close(tokens, i, "blockquote_close")
            inner = _blocks_from_tokens(tokens[i + 1 : close], warnings, callouts=callout_map)
            blocks.append(n.BlockQuote(children=inner))
            i = close + 1
        elif tok.type == "table_open":
            close = _find_close(tokens, i, "table_close")
            table = _parse_table(tokens, i, close)
            blocks.append(table)
            i = close + 1
        elif tok.type == "hr":
            blocks.append(n.ThematicBreak())
            i += 1
        elif tok.type == "html_block":
            raw = tok.content.strip()
            callout_match = CALLOUT_PLACEHOLDER_RE.match(raw)
            if callout_match:
                idx = int(callout_match.group(1))
                kind, children = callout_map[idx]
                blocks.append(n.Callout(kind=kind, children=children))
            elif PAGEBREAK_COMMENT.match(raw):
                blocks.append(n.PageBreak())
            else:
                blocks.append(n.HTMLBlock(raw))
            i += 1
        elif tok.type == "math_block":
            blocks.append(n.MathBlock(tok.content))
            i += 1
        elif tok.type == "footnote_block_open":
            i = _find_close(tokens, i, "footnote_block_close") + 1
        else:
            if tok.type not in ("inline", "paragraph_close", "list_item_open", "list_item_close"):
                if tok.content:
                    warnings.append(f"unhandled token {tok.type}")
                    blocks.append(n.Paragraph((n.Text(tok.content),)))
            i += 1
    return tuple(blocks)


def _parse_list_items(
    tokens: list[Token],
    start: int,
    end: int,
    ordered: bool,
    callouts: dict[int, tuple[str, tuple[n.Block, ...]]],
) -> list[n.ListItem]:
    items: list[n.ListItem] = []
    i = start
    while i < end:
        if tokens[i].type != "list_item_open":
            i += 1
            continue
        close = _find_close(tokens, i, "list_item_close")
        checked: bool | None = None
        cls = tokens[i].attrGet("class") or ""
        if "task-list-item" in cls:
            for j in range(i + 1, close):
                if tokens[j].type == "list_item_open":
                    break
                if tokens[j].type == "paragraph_open":
                    inline = tokens[j + 1]
                    if inline.type == "inline" and inline.children:
                        first = inline.children[0]
                        if first.type == "html_inline" and "checkbox" in first.content:
                            checked = "checked" in first.content
        inner_blocks = _blocks_from_tokens(tokens[i + 1 : close], [], callouts=callouts)
        items.append(n.ListItem(children=inner_blocks, checked=checked))
        i = close + 1
    return items


def _parse_table(tokens: list[Token], start: int, end: int) -> n.Table:
    rows: list[tuple[n.TableCell, ...]] = []
    i = start + 1
    while i < end:
        if tokens[i].type != "tr_open":
            i += 1
            continue
        tr_close = _find_close(tokens, i, "tr_close")
        cells: list[n.TableCell] = []
        j = i + 1
        while j < tr_close:
            if tokens[j].type in ("th_open", "td_open"):
                is_header = tokens[j].type == "th_open"
                cell_close = _find_close(tokens, j, "th_close" if is_header else "td_close")
                align = tokens[j].attrGet("style") or "default"
                if "center" in align:
                    alignment: n.Alignment = "center"
                elif "right" in align:
                    alignment = "right"
                elif "left" in align:
                    alignment = "left"
                else:
                    alignment = "default"
                inline = tokens[j + 1] if j + 1 < cell_close else None
                if inline and inline.type == "inline":
                    children = (n.Paragraph(_inline_children([inline], 0, 1)),)
                else:
                    children = ()
                cells.append(
                    n.TableCell(children=children, align=alignment, header=is_header)
                )
                j = cell_close + 1
            else:
                j += 1
        if cells:
            rows.append(tuple(cells))
        i = tr_close + 1
    return n.Table(rows=tuple(rows))


def _preprocess_containers(text: str) -> str:
    text = PAGEBREAK_CONTAINER_RE.sub("<!-- pagebreak -->", text)
    return text


def _parse_inner_blocks(
    text: str,
    warnings: list[str],
) -> tuple[n.Block, ...]:
    text = _preprocess_containers(text)
    md = _make_md()
    tokens = md.parse(text)
    blocks = _blocks_from_tokens(tokens, warnings, callouts={})
    return _split_block_images(blocks)


def _extract_callouts(
    text: str,
    warnings: list[str],
) -> tuple[str, dict[int, tuple[str, tuple[n.Block, ...]]]]:
    callouts: dict[int, tuple[str, tuple[n.Block, ...]]] = {}
    counter = 0

    def replacer(match: re.Match[str]) -> str:
        nonlocal counter
        kind = match.group(1).lower()
        inner = match.group(2).strip()
        children = _parse_inner_blocks(inner, warnings)
        idx = counter
        counter += 1
        callouts[idx] = (kind, children)
        return f"<!-- odm-callout:{idx} -->\n"

    text = CALLOUT_RE.sub(replacer, text)
    return text, callouts


def _extract_footnotes(tokens: list[Token]) -> tuple[n.FootnoteDef, ...]:
    footnotes: list[n.FootnoteDef] = []
    i = 0
    while i < len(tokens):
        if tokens[i].type == "footnote_block_open":
            close = _find_close(tokens, i, "footnote_block_close")
            j = i + 1
            while j < close:
                if tokens[j].type == "footnote_open":
                    key = tokens[j].meta.get("label")
                    if key is None:
                        key = tokens[j].meta.get("id", str(len(footnotes) + 1))
                    fc = _find_close(tokens, j, "footnote_close")
                    inner = _blocks_from_tokens(tokens[j + 1 : fc], [], callouts={})
                    footnotes.append(n.FootnoteDef(key=str(key), children=inner))
                    j = fc + 1
                else:
                    j += 1
            i = close + 1
        else:
            i += 1
    return tuple(footnotes)


def _fig_id_from_text(value: str) -> str | None:
    m = FIG_ID_RE.search(value.strip())
    if not m:
        return None
    return f"{m.group(1)}:{m.group(2)}"


def _split_softbreak_segments(
    children: tuple[n.Inline, ...],
) -> list[tuple[n.Inline, ...]]:
    segments: list[list[n.Inline]] = [[]]
    for child in children:
        if isinstance(child, n.SoftBreak):
            segments.append([])
        else:
            segments[-1].append(child)
    return [tuple(seg) for seg in segments if seg]


def _image_from_segment(
    segment: tuple[n.Inline, ...],
) -> n.Image | None:
    if not segment or not isinstance(segment[0], n.InlineImage):
        return None
    img = segment[0]
    src, alt, title, identifier = _parse_image_attrs(img.src, img.alt, img.title)
    rest = segment[1:]
    if not identifier and len(rest) == 1 and isinstance(rest[0], n.Text):
        identifier = _fig_id_from_text(rest[0].value)
        rest = ()
    if rest:
        return None
    return n.Image(src=src, alt=alt, title=title, identifier=identifier)


def _table_caption_from_segment(
    segment: tuple[n.Inline, ...],
) -> tuple[str, str | None] | None:
    if len(segment) != 1 or not isinstance(segment[0], n.Text):
        return None
    match = TABLE_CAPTION_RE.match(segment[0].value.strip())
    if not match:
        return None
    return match.group(1).strip(), match.group(2)


def _split_block_images(blocks: tuple[n.Block, ...]) -> tuple[n.Block, ...]:
    """Promote images / Table: captions even when normalizer collapsed blank lines."""
    result: list[n.Block] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]

        if isinstance(block, n.Paragraph):
            segments = _split_softbreak_segments(block.children)
            pending: list[tuple[n.Inline, ...]] = []

            def flush_pending() -> None:
                nonlocal pending
                if not pending:
                    return
                inlines: list[n.Inline] = []
                for idx, seg in enumerate(pending):
                    if idx:
                        inlines.append(n.SoftBreak())
                    inlines.extend(seg)
                result.append(n.Paragraph(tuple(inlines)))
                pending = []

            for seg_i, segment in enumerate(segments):
                image = _image_from_segment(segment)
                if image is not None:
                    flush_pending()
                    result.append(image)
                    continue

                # Table caption as its own softbreak segment immediately before a table
                is_last = seg_i == len(segments) - 1
                cap = _table_caption_from_segment(segment) if is_last else None
                if (
                    cap is not None
                    and i + 1 < len(blocks)
                    and isinstance(blocks[i + 1], n.Table)
                ):
                    flush_pending()
                    caption, tbl_id = cap
                    table = blocks[i + 1]
                    identifier = f"tbl:{tbl_id}" if tbl_id else table.identifier
                    result.append(
                        n.Table(
                            rows=table.rows,
                            identifier=identifier,
                            caption=caption,
                        )
                    )
                    i += 2
                    pending = []
                    break

                pending.append(segment)
            else:
                flush_pending()
                i += 1
            continue

        result.append(block)
        i += 1
    return tuple(result)


def parse_markdown(text: str, *, source_path: Path | None = None) -> n.Document:
    warnings: list[str] = []
    metadata, body = parse_frontmatter(text)
    body = _preprocess_containers(body)
    body, callouts = _extract_callouts(body, warnings)
    md = _make_md()
    tokens = md.parse(body)
    footnotes = _extract_footnotes(tokens)
    blocks = _blocks_from_tokens(tokens, warnings, callouts=callouts)
    blocks = _split_block_images(blocks)
    for w in warnings:
        print(f"warning: {w}", file=sys.stderr)
    return n.Document(blocks=blocks, metadata=metadata, footnotes=footnotes)
