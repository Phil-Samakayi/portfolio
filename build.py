"""Build a static copy of the portfolio for GitHub Pages.

Usage:
    python build.py                  # site served from the domain root
    python build.py /portfolio/      # site served from a sub-path (GitHub project page)

Output goes to ./dist
"""
import shutil
import sys
from datetime import datetime
from pathlib import Path

from flask import render_template

import content
from app import app, site_data

BASE_DIR = Path(__file__).resolve().parent
DIST = BASE_DIR / "dist"


def normalise_base(base: str) -> str:
    base = "/" + base.strip("/") + "/"
    return "/" if base == "//" else base


def build(base: str = "/") -> None:
    base = normalise_base(base)
    app.config["STATIC_BASE_URL"] = base

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    shutil.copytree(BASE_DIR / "static", DIST / "static")

    with app.test_request_context():
        index_html = render_template(
            "index.html",
            profile=content.PROFILE,
            skills=content.SKILLS,
            projects=content.PROJECTS,
            categories=content.CATEGORIES,
            journey=content.JOURNEY,
            site_data=site_data(),
            year=datetime.now().year,
        )
        not_found_html = render_template("404.html", profile=content.PROFILE)

    (DIST / "index.html").write_text(index_html, encoding="utf-8")
    (DIST / "404.html").write_text(not_found_html, encoding="utf-8")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")  # serve files as-is
    print(f"Built static site in {DIST} (base path: {base})")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "/")
