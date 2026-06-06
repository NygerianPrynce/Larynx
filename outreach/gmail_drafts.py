"""
gmail_drafts.py — Create Gmail DRAFTS in your personal account via the Gmail API.

Creates drafts (never sends) so you review each one before hitting send.

One-time setup (see README.md):
  1. Enable the Gmail API in your Google Cloud project.
  2. Create an OAuth client ID (type: Desktop app), download it as
     outreach/credentials.json.
  3. Add your Gmail as a "test user" on the OAuth consent screen.
  4. First run opens a browser to authorize; the token is saved to token.json.
"""

import base64
import os
from email.mime.text import MIMEText

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.compose"]  # drafts only — cannot send
_HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.path.join(_HERE, "token.json")
CREDS = os.path.join(_HERE, "credentials.json")


def get_service():
    creds = None
    if os.path.exists(TOKEN):
        creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDS):
                raise SystemExit(
                    "Missing credentials.json — download an OAuth 'Desktop app' client "
                    "from Google Cloud Console into the outreach/ folder (see README)."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDS, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN, "w") as f:
            f.write(creds.to_json())
    return build("gmail", "v1", credentials=creds)


def create_draft(service, to: str, subject: str, body: str) -> dict:
    msg = MIMEText(body)
    msg["to"] = to
    msg["subject"] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    return service.users().drafts().create(
        userId="me", body={"message": {"raw": raw}}
    ).execute()
