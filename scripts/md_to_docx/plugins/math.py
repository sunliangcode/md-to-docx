"""Math plugin — documents that math is handled at parse/render time.

Kept as a named built-in so ``--no-plugins`` and plugin listings stay consistent.
"""

from __future__ import annotations

from md_to_docx.ast import nodes as n
from md_to_docx.plugin.base import PluginBase, PluginContext


class MathPlugin(PluginBase):
    """No-op transform; LaTeX → OMML happens in ``render.omml``."""

    name = "math"

    def transform(self, document: n.Document, ctx: PluginContext) -> n.Document:
        return document
