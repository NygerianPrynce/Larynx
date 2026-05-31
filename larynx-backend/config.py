from fastapi import FastAPI, Request, HTTPException
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from auth.google_oauth import oauth
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime, timedelta, timezone
from fastapi import Depends
import os
from talon import quotations
from talon.signature.bruteforce import extract_signature
from nltk_processor import process_email_text
import openai

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

# Fail fast on startup rather than getting a cryptic DNS error at runtime.
if not supabase_url:
    raise RuntimeError("SUPABASE_URL environment variable is not set")
if not supabase_key:
    raise RuntimeError("SUPABASE_KEY environment variable is not set")

supabase = create_client(supabase_url, supabase_key)
openai.api_key = os.getenv("OPENAI_API_KEY")

