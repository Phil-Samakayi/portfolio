"""Personal portfolio — Flask application.

Run locally:
    pip install -r requirements.txt
    python app.py
Then open http://127.0.0.1:5000
"""
import os
import re
import smtplib
import sqlite3
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

from flask import Flask, jsonify, render_template, request

import content

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("PORTFOLIO_DB", BASE_DIR / "messages.db"))
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024  # contact payloads are small

# Simple in-memory rate limit: max 5 messages per IP per 10 minutes.
RATE_LIMIT, RATE_WINDOW = 5, 600
_hits: dict[str, list[float]] = {}


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS messages (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               email TEXT NOT NULL,
               message TEXT NOT NULL,
               ip TEXT,
               created_at TEXT NOT NULL
           )"""
    )
    return conn


def rate_limited(ip: str) -> bool:
    now = time.time()
    recent = [t for t in _hits.get(ip, []) if now - t < RATE_WINDOW]
    if len(recent) >= RATE_LIMIT:
        _hits[ip] = recent
        return True
    recent.append(now)
    _hits[ip] = recent
    return False


def send_notification(name: str, email: str, message: str) -> None:
    """Email the message to yourself if SMTP_* environment variables are set."""
    host = os.environ.get("SMTP_HOST")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    if not (host and user and password):
        return
    msg = EmailMessage()
    msg["Subject"] = f"Portfolio message from {name}"
    msg["From"] = user
    msg["To"] = os.environ.get("CONTACT_TO", content.PROFILE["email"])
    msg["Reply-To"] = email
    msg.set_content(f"From: {name} <{email}>\n\n{message}")
    try:
        with smtplib.SMTP_SSL(host, int(os.environ.get("SMTP_PORT", 465)), timeout=10) as smtp:
            smtp.login(user, password)
            smtp.send_message(msg)
    except Exception as exc:  # the message is already saved; don't fail the request
        app.logger.warning("Could not send notification email: %s", exc)


@app.route("/")
def index():
    return render_template(
        "index.html",
        profile=content.PROFILE,
        skills=content.SKILLS,
        projects=content.PROJECTS,
        categories=content.CATEGORIES,
        journey=content.JOURNEY,
        year=datetime.now().year,
    )


@app.route("/api/portfolio")
def api_portfolio():
    """Data used by the project modals and the interactive terminal."""
    return jsonify(
        profile=content.PROFILE,
        skills=content.SKILLS,
        projects=content.PROJECTS,
        journey=content.JOURNEY,
    )


@app.route("/api/contact", methods=["POST"])
def api_contact():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    message = str(data.get("message", "")).strip()

    # Honeypot: real visitors never fill this hidden field. Pretend success.
    if str(data.get("website", "")).strip():
        return jsonify(ok=True)

    errors = {}
    if not 2 <= len(name) <= 80:
        errors["name"] = "Please enter your name."
    if not EMAIL_RE.match(email) or len(email) > 120:
        errors["email"] = "Please enter a valid email address."
    if not 10 <= len(message) <= 3000:
        errors["message"] = "Your message should be between 10 and 3000 characters."
    if errors:
        return jsonify(ok=False, errors=errors), 400

    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "").split(",")[0].strip()
    if rate_limited(ip):
        return jsonify(ok=False, error="Too many messages. Please try again later."), 429

    with get_db() as conn:
        conn.execute(
            "INSERT INTO messages (name, email, message, ip, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, message, ip, datetime.now(timezone.utc).isoformat()),
        )
    send_notification(name, email, message)
    return jsonify(ok=True)


@app.errorhandler(404)
def not_found(_):
    return render_template("404.html", profile=content.PROFILE), 404


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", port=int(os.environ.get("PORT", 5000)))
