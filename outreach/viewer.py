"""
viewer.py — Tiny localhost UI to read the outreach CSV and download it.

    python viewer.py     →  http://localhost:5055
"""

import csv
import os

from flask import Flask, render_template_string, send_file, abort

app = Flask(__name__)
CSV_FILE = "ready_to_send.csv"

TPL = """
<!doctype html>
<title>Larynx Outreach</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; margin: 40px; color:#1f2937; }
  h1 { margin-bottom: 4px; }
  .meta { color:#6b7280; margin-bottom: 20px; }
  a.btn { background:#7c3aed; color:#fff; padding:8px 14px; border-radius:8px; text-decoration:none; }
  table { border-collapse: collapse; width: 100%; margin-top: 20px; }
  th, td { border: 1px solid #e5e7eb; padding: 10px; vertical-align: top; text-align:left; }
  th { background:#f9fafb; }
  pre { white-space: pre-wrap; margin:0; font-family: inherit; font-size: 13px; }
  .noemail { color:#ef4444; font-weight:600; }
</style>
<h1>Outreach list</h1>
<div class="meta">{{ rows|length }} companies · {{ with_email }} with an email</div>
<a class="btn" href="/download">⬇ Download CSV</a>
<table>
  <tr><th>Name</th><th>Email</th><th>Subject</th><th>Body</th></tr>
  {% for r in rows %}
  <tr>
    <td>{{ r.Name }}<br><small>{{ r.Website }}</small></td>
    <td>{% if r.Email %}{{ r.Email }}{% else %}<span class="noemail">none</span>{% endif %}</td>
    <td>{{ r.Subject }}</td>
    <td><pre>{{ r.Body }}</pre></td>
  </tr>
  {% endfor %}
</table>
"""


@app.route("/")
def home():
    rows = list(csv.DictReader(open(CSV_FILE, newline=""))) if os.path.exists(CSV_FILE) else []
    with_email = sum(1 for r in rows if r.get("Email"))
    return render_template_string(TPL, rows=rows, with_email=with_email)


@app.route("/download")
def download():
    if not os.path.exists(CSV_FILE):
        abort(404)
    return send_file(CSV_FILE, as_attachment=True)


if __name__ == "__main__":
    app.run(port=5055, debug=True)
