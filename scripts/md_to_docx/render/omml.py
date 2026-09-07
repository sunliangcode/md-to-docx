"""MathML to OMML conversion."""

from __future__ import annotations

import sys
from xml.etree import ElementTree as ET

from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph

MATH_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math"


def _omml_tag(name: str) -> str:
    return f"{{{MATH_NS}}}{name}"


def _mathml_to_omml(mathml: str) -> ET.Element | None:
    try:
        root = ET.fromstring(mathml)
    except ET.ParseError:
        return None

    def convert(node: ET.Element) -> ET.Element | None:
        tag = node.tag.split("}")[-1] if "}" in node.tag else node.tag
        if tag == "math":
            omath = ET.Element(_omml_tag("oMath"))
            for child in node:
                c = convert(child)
                if c is not None:
                    omath.append(c)
            return omath
        if tag in ("mi", "mn", "mo", "mtext"):
            r = ET.Element(_omml_tag("r"))
            t = ET.Element(_omml_tag("t"))
            parts = [node.text or ""]
            for c in node:
                if c.text:
                    parts.append(c.text)
                if c.tail:
                    parts.append(c.tail)
            t.text = "".join(parts)
            r.append(t)
            return r
        if tag == "mfrac":
            f = ET.Element(_omml_tag("f"))
            num = ET.Element(_omml_tag("num"))
            den = ET.Element(_omml_tag("den"))
            children = list(node)
            if len(children) >= 2:
                c0 = convert(children[0])
                c1 = convert(children[1])
                if c0 is not None:
                    num.append(c0)
                if c1 is not None:
                    den.append(c1)
            f.append(num)
            f.append(den)
            return f
        if tag == "msup":
            s = ET.Element(_omml_tag("sSup"))
            e = ET.Element(_omml_tag("e"))
            sup = ET.Element(_omml_tag("sup"))
            children = list(node)
            if children:
                c0 = convert(children[0])
                if c0 is not None:
                    e.append(c0)
            if len(children) > 1:
                c1 = convert(children[1])
                if c1 is not None:
                    sup.append(c1)
            s.append(e)
            s.append(sup)
            return s
        if tag == "msub":
            s = ET.Element(_omml_tag("sSub"))
            e = ET.Element(_omml_tag("e"))
            sub = ET.Element(_omml_tag("sub"))
            children = list(node)
            if children:
                c0 = convert(children[0])
                if c0 is not None:
                    e.append(c0)
            if len(children) > 1:
                c1 = convert(children[1])
                if c1 is not None:
                    sub.append(c1)
            s.append(e)
            s.append(sub)
            return s
        if tag == "msubsup":
            s = ET.Element(_omml_tag("sSubSup"))
            e = ET.Element(_omml_tag("e"))
            sub = ET.Element(_omml_tag("sub"))
            sup = ET.Element(_omml_tag("sup"))
            children = list(node)
            if children:
                c0 = convert(children[0])
                if c0 is not None:
                    e.append(c0)
            if len(children) > 1:
                c1 = convert(children[1])
                if c1 is not None:
                    sub.append(c1)
            if len(children) > 2:
                c2 = convert(children[2])
                if c2 is not None:
                    sup.append(c2)
            s.append(e)
            s.append(sub)
            s.append(sup)
            return s
        if tag == "msqrt":
            rad = ET.Element(_omml_tag("rad"))
            deg = ET.Element(_omml_tag("deg"))
            e = ET.Element(_omml_tag("e"))
            for child in node:
                c = convert(child)
                if c is not None:
                    e.append(c)
            rad.append(deg)
            rad.append(e)
            return rad
        if tag == "mroot":
            rad = ET.Element(_omml_tag("rad"))
            deg = ET.Element(_omml_tag("deg"))
            e = ET.Element(_omml_tag("e"))
            children = list(node)
            if children:
                c0 = convert(children[0])
                if c0 is not None:
                    e.append(c0)
            if len(children) > 1:
                c1 = convert(children[1])
                if c1 is not None:
                    deg.append(c1)
            rad.append(deg)
            rad.append(e)
            return rad
        if tag in ("mrow", "math"):
            # Nested mrow → flatten into oMath-like sequence via d (delimiter) free group.
            inner: list[ET.Element] = []
            for child in node:
                c = convert(child)
                if c is not None:
                    inner.append(c)
            if len(inner) == 1:
                return inner[0]
            # Wrap multiple children in an e-less group using nary-free oMath children:
            # return a phantom row as consecutive elements via a delimiter with empty chars.
            d = ET.Element(_omml_tag("d"))
            d_pr = ET.Element(_omml_tag("dPr"))
            beg = ET.Element(_omml_tag("begChr"))
            beg.set(f"{{{MATH_NS}}}val", "")
            end = ET.Element(_omml_tag("endChr"))
            end.set(f"{{{MATH_NS}}}val", "")
            d_pr.append(beg)
            d_pr.append(end)
            d.append(d_pr)
            e = ET.Element(_omml_tag("e"))
            for c in inner:
                e.append(c)
            d.append(e)
            return d
        if tag == "mfenced":
            d = ET.Element(_omml_tag("d"))
            d_pr = ET.Element(_omml_tag("dPr"))
            beg = ET.Element(_omml_tag("begChr"))
            beg.set(f"{{{MATH_NS}}}val", node.get("open", "("))
            end = ET.Element(_omml_tag("endChr"))
            end.set(f"{{{MATH_NS}}}val", node.get("close", ")"))
            d_pr.append(beg)
            d_pr.append(end)
            d.append(d_pr)
            e = ET.Element(_omml_tag("e"))
            for child in node:
                c = convert(child)
                if c is not None:
                    e.append(c)
            d.append(e)
            return d
        if tag == "mover":
            s = ET.Element(_omml_tag("sSup"))  # approximate accent as superscript
            # Prefer acc when possible
            acc = ET.Element(_omml_tag("acc"))
            e = ET.Element(_omml_tag("e"))
            children = list(node)
            if children:
                c0 = convert(children[0])
                if c0 is not None:
                    e.append(c0)
            acc.append(e)
            if len(children) > 1:
                acc_pr = ET.Element(_omml_tag("accPr"))
                chr_el = ET.Element(_omml_tag("chr"))
                # Use text of accent child when available
                accent = ""
                for t in children[1].iter():
                    if t.text:
                        accent += t.text
                if accent:
                    chr_el.set(f"{{{MATH_NS}}}val", accent[0])
                    acc_pr.append(chr_el)
                    acc.insert(0, acc_pr)
            return acc
        if tag == "munder":
            lim = ET.Element(_omml_tag("limLow"))
            e = ET.Element(_omml_tag("e"))
            lim_el = ET.Element(_omml_tag("lim"))
            children = list(node)
            if children:
                c0 = convert(children[0])
                if c0 is not None:
                    e.append(c0)
            if len(children) > 1:
                c1 = convert(children[1])
                if c1 is not None:
                    lim_el.append(c1)
            lim.append(e)
            lim.append(lim_el)
            return lim
        if tag == "mtable":
            m = ET.Element(_omml_tag("m"))
            for row in node:
                rtag = row.tag.split("}")[-1] if "}" in row.tag else row.tag
                if rtag != "mtr":
                    continue
                mr = ET.Element(_omml_tag("mr"))
                for cell in row:
                    ctag = cell.tag.split("}")[-1] if "}" in cell.tag else cell.tag
                    if ctag not in ("mtd",):
                        continue
                    e = ET.Element(_omml_tag("e"))
                    for child in cell:
                        c = convert(child)
                        if c is not None:
                            e.append(c)
                    mr.append(e)
                m.append(mr)
            return m
        if tag in ("mstyle", "mpadded", "semantics", "annotation-xml"):
            # Transparent wrappers — convert first meaningful child / all children.
            inner_el = ET.Element(_omml_tag("e"))
            converted: list[ET.Element] = []
            for child in node:
                ctag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
                if ctag == "annotation":
                    continue
                c = convert(child)
                if c is not None:
                    converted.append(c)
            if len(converted) == 1:
                return converted[0]
            for c in converted:
                inner_el.append(c)
            return inner_el if converted else None
        # Unknown node: try converting children; else skip.
        converted = []
        for child in node:
            c = convert(child)
            if c is not None:
                converted.append(c)
        if len(converted) == 1:
            return converted[0]
        if converted:
            e = ET.Element(_omml_tag("e"))
            for c in converted:
                e.append(c)
            return e
        return None

    return convert(root)


def _insert_omml(paragraph: Paragraph, omath_el: ET.Element) -> None:
    paragraph._p.append(omath_el)


def add_inline_math(paragraph: Paragraph, latex: str) -> None:
    try:
        import latex2mathml.converter

        mathml = latex2mathml.converter.convert(latex)
        omath = _mathml_to_omml(mathml)
        if omath is not None:
            _insert_omml(paragraph, omath)
            return
        print("warning: math OMML conversion returned empty; using plaintext", file=sys.stderr)
    except Exception as exc:  # noqa: BLE001
        print(f"warning: math render failed: {exc}", file=sys.stderr)
    run = paragraph.add_run(latex)
    run.font.name = "Consolas"


def add_block_math(paragraph: Paragraph, latex: str) -> None:
    omath_para = OxmlElement("m:oMathPara")
    omath_para.set(qn("xmlns:m"), MATH_NS)
    try:
        import latex2mathml.converter

        mathml = latex2mathml.converter.convert(latex)
        omath = _mathml_to_omml(mathml)
        if omath is not None:
            omath_para.append(omath)
            paragraph._p.append(omath_para)
            return
        print(
            "warning: math block OMML conversion returned empty; using plaintext",
            file=sys.stderr,
        )
    except Exception as exc:  # noqa: BLE001
        print(f"warning: math block render failed: {exc}", file=sys.stderr)
    run = paragraph.add_run(latex)
    run.font.name = "Consolas"
