"""
Centralized email processing service
Eliminates duplicate email extraction and processing logic
"""

import base64
import logging
from typing import Optional, Dict, Tuple
from bs4 import BeautifulSoup
from talon import quotations
from talon.signature.bruteforce import extract_signature
import re


class EmailProcessingService:
    """Centralized email processing service"""
    
    @staticmethod
    def extract_email_body(full_msg: dict) -> str:
        """
        Extract the email body from Gmail API response with improved handling of various email formats
        """
        def extract_from_payload(payload: dict) -> tuple[str, str]:
            """Extract text from a payload, returns (plain_text, html_text)"""
            plain_text = ""
            html_text = ""
            
            # Check if body is directly in payload
            if "data" in payload.get("body", {}):
                try:
                    content = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="ignore")
                    if payload.get("mimeType") == "text/plain":
                        plain_text = content
                    elif payload.get("mimeType") == "text/html":
                        html_text = content
                except Exception as e:
                    logging.error(f"Error decoding body: {e}")
            
            # Check parts for content
            if "parts" in payload:
                for part in payload["parts"]:
                    part_plain, part_html = extract_from_payload(part)
                    if part_plain:
                        plain_text = part_plain
                    if part_html:
                        html_text = part_html
                    
                    # If we found both, we can stop
                    if plain_text and html_text:
                        break
            
            return plain_text, html_text
        
        # Extract content from the main payload
        plain_text, html_text = extract_from_payload(full_msg["payload"])
        
        # Prefer plain text, fallback to HTML
        if plain_text and len(plain_text.strip()) >= 10:
            return plain_text
        elif html_text and len(html_text.strip()) >= 10:
            # Convert HTML to plain text using BeautifulSoup
            try:
                soup = BeautifulSoup(html_text, 'html.parser')
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                # Get text and clean it up
                text = soup.get_text()
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                return text if len(text.strip()) >= 10 else ""
            except Exception as e:
                logging.error(f"Error converting HTML to text: {e}")
                return html_text  # Return raw HTML as fallback
        
        return ""
    
    @staticmethod
    def clean_email_body(raw_body: str) -> Tuple[str, Optional[str]]:
        """
        Clean email body using Talon and custom logic
        Returns: (cleaned_body, signature)
        """
        # Step 1: Remove quoted reply history
        no_quotes = quotations.extract_from(raw_body, 'text/plain')

        # Step 2: Extract signature
        body_no_sig, signature = extract_signature(no_quotes)

        # Step 3: Remove standalone URL-only lines
        lines = body_no_sig.splitlines()
        filtered_lines = [
            line for line in lines
            if not re.match(r"^\s*(https?://\S+|www\.\S+)\s*$", line.strip())
        ]
        joined = " ".join(filtered_lines)

        # Step 4: Clean extra artifacts
        cleaned = re.sub(r"\*+.*?\*+", "", joined)  # remove markdown emphasis
        cleaned = re.sub(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", "", cleaned)  # remove phone numbers
        cleaned = re.sub(r"\s+", " ", cleaned).strip()  # collapse extra spaces

        return cleaned, signature.strip() if signature else None
    
    @staticmethod
    def extract_sender_name(sender: str) -> str:
        """
        Extract sender name from email address
        """
        if not sender:
            return "there"
        
        # Handle "Name <email@domain.com>" format
        if '<' in sender and '>' in sender:
            name_part = sender.split('<')[0].strip()
            if name_part:
                return name_part
        
        # Handle "email@domain.com" format
        if '@' in sender:
            return sender.split('@')[0].replace('.', ' ').title()
        
        return sender
    
    @staticmethod
    def is_email_empty_or_too_short(email_body: str, min_length: int = 10) -> bool:
        """
        Check if email body is empty or too short to process
        """
        return not email_body or len(email_body.strip()) < min_length
    
    @staticmethod
    def get_email_headers(full_msg: dict) -> Dict[str, str]:
        """
        Extract common email headers from Gmail API response
        """
        headers_list = full_msg.get("payload", {}).get("headers", [])
        
        return {
            "subject": next((h["value"] for h in headers_list if h["name"] == "Subject"), "(No Subject)"),
            "sender": next((h["value"] for h in headers_list if h["name"] == "From"), "(Unknown Sender)"),
            "date": next((h["value"] for h in headers_list if h["name"] == "Date"), ""),
            "message_id": next((h["value"] for h in headers_list if h["name"] == "Message-ID"), ""),
        }
