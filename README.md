# Portfolio (Flask)

## Run locally

```bash
python -m venv venv
venv\Scripts\activate        # Windows  (macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

## Edit your content

Everything on the site (bio, skills, projects, journey, links) is in **`content.py`**.
Add a `link` to a project to show a "Visit project" button in its modal.

## Contact form

Messages are validated, rate-limited and saved to `messages.db` (SQLite). Read them with:

```bash
python -c "import sqlite3; [print(r) for r in sqlite3.connect('messages.db').execute('select created_at,name,email,message from messages')]"
```

To also receive each message by email, set these environment variables
(for Gmail, use an App Password): `SMTP_HOST` (e.g. `smtp.gmail.com`), `SMTP_USER`,
`SMTP_PASSWORD`, and optionally `SMTP_PORT` (default 465) and `CONTACT_TO`.

## Deploy

### GitHub Pages (static, free)

Every push to `main` builds a static copy with `build.py` and publishes it through
`.github/workflows/pages.yml`. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
The site is then live at `https://<username>.github.io/<repo>/`.

GitHub Pages can't run Python, so the contact form there uses `FORM_ENDPOINT` in `content.py`
(a free https://formspree.io form). If it's empty, the form opens the visitor's email app instead.

To preview the static build locally: `python build.py` then `python -m http.server -d dist`.

### Full Flask app (Render, Railway, PythonAnywhere)

Start command: `gunicorn app:app`. Here the contact form saves to `messages.db` and can email you.
On hosts with an ephemeral disk, set up the SMTP variables or point `PORTFOLIO_DB` at a persistent disk.

## Structure

```
app.py              Flask routes and contact API
build.py            Static build for GitHub Pages
content.py          All site content
templates/          index.html, 404.html
static/css/style.css
static/js/main.js   Animations, project filter and modal, terminal, form
```
