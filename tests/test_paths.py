"""Bundled asset path resolution tests."""

from __future__ import annotations

from pathlib import Path

from md_to_docx.paths import (
    _repo_root,
    _resolve_asset_path,
    assets_dir,
    bundled_path,
    bundled_resource,
    data_dir,
    native_reference_doc,
    preset_template,
)


def test_repo_root_contains_assets_and_scripts():
    root = _repo_root()
    assert (root / "assets").is_dir()
    assert (root / "scripts" / "md_to_docx").is_dir()


def test_assets_and_data_dir_point_at_repo_assets():
    assert assets_dir() == _repo_root() / "assets"
    assert data_dir() == assets_dir()
    assert assets_dir().is_dir()


def test_native_reference_doc_exists():
    path = native_reference_doc()
    assert path.is_file()
    assert path.name == "reference-native.docx"
    assert path.stat().st_size > 1000


def test_preset_template_resolves_known_presets():
    for name in ("technical", "professional", "academic"):
        path = preset_template(name)
        assert path.is_file(), name
        assert path.name == f"{name}.docx"


def test_bundled_path_and_resource_for_preset():
    with bundled_path("presets/technical.docx") as path:
        assert path.is_file()
        assert path.suffix == ".docx"
    resource = bundled_resource("presets/technical.docx")
    assert isinstance(resource, Path)
    assert resource.is_file()


def test_resolve_asset_path_missing_returns_none():
    assert _resolve_asset_path("presets/does-not-exist.docx") is None
