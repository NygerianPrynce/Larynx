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
supabase = create_client(supabase_url, supabase_key)
openai.api_key = os.getenv("OPENAI_API_KEY")

