from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime
from functions import fetch_tone_profile
from config import supabase
from openai import OpenAI
import re
from typing import List, Dict, Any, Optional
from difflib import SequenceMatcher
import inflect
from fuzzywuzzy import fuzz, process
from functions import clean_email_body

router = APIRouter()
client = OpenAI()

# ─── Request + Response schemas ──────────────────────────────────────
class DraftRequest(BaseModel):
    subject: str
    body: str

class DraftResponse(BaseModel):
    draft: str
    prompt: str
    matched_inventory: Optional[List[Dict]] = None

class TestInventoryRequest(BaseModel):
    email_content: str

class TestInventoryResponse(BaseModel):
    extracted_requests: List[Dict]
    matched_inventory: List[Dict]
    inventory_context: str
    total_inventory_items: int

# ─── Enhanced Inventory Matching System ──────────────────────────────────────
class InventoryMatcher:
    def __init__(self):
        self.p = inflect.engine()
        
        # Common request patterns
        self.request_patterns = [
            r'(?:price|cost|pricing|quote|quotation)\s+(?:for|on|of)?\s*([^.!?]+)',
            r'(?:how much|what.{0,20}cost|what.{0,20}price)\s+(?:for|is|are|would)?\s*([^.!?]+)',
            r'(?:availability|available|do you have|got any)\s+(?:of|for)?\s*([^.!?]+)',
            r'(?:need|looking for|want|interested in|require)\s+(?:some|a|an|the)?\s*([^.!?]+)',
            r'(?:rental|rent|hire)\s+(?:of|for)?\s*([^.!?]+)',
            r'(?:can you provide|do you offer|do you carry)\s+([^.!?]+)',
        ]
        
        # Generic inquiry patterns
        self.generic_patterns = [
            r'what\s+(?:kind|type|sorts?)\s+of\s+([^.!?]+)\s+(?:do you have|are available|do you offer)',
            r'(?:do you have|got)\s+any\s+([^.!?]+)',
            r'what\s+([^.!?]+)\s+(?:do you have|are available)',
            r'show me\s+(?:your|the|all)?\s*([^.!?]+)',
            r'list\s+(?:of|your)?\s*([^.!?]+)',
            r'what.{0,20}(?:available|inventory|stock|options)\s+(?:for|of)?\s*([^.!?]+)',
        ]
        
        # Quantity patterns
        self.quantity_patterns = [
            r'(\d+)\s*(?:x\s*)?([^.!?]+)',
            r'(\d+)\s+(?:pieces?|items?|units?)\s+(?:of\s+)?([^.!?]+)',
            r'([^.!?]+)\s*(?:x|×)\s*(\d+)',
            r'([^.!?]+)\s*[-–]\s*(\d+)\s*(?:pieces?|pcs?|units?)?',
        ]
        
        # Product category keywords for better matching
        self.category_keywords = {
            'chairs': ['chair', 'seating', 'seat'],
            'tables': ['table', 'desk', 'surface'],
            'linens': ['linen', 'tablecloth', 'napkin', 'runner'],
            'lighting': ['light', 'lamp', 'chandelier', 'fixture'],
            'decor': ['decoration', 'centerpiece', 'vase', 'candle'],
            'tents': ['tent', 'canopy', 'shelter'],
            'audio': ['speaker', 'microphone', 'sound', 'audio'],
        }
    
    def normalize_product_name(self, name: str) -> str:
        """Normalize product name for matching"""
        normalized = re.sub(r'\s+', ' ', name.lower().strip())
        normalized = re.sub(r'[^\w\s]', '', normalized)
        
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'some', 'any'}
        words = normalized.split()
        filtered_words = [word for word in words if word not in stop_words and len(word) > 1]
        
        return ' '.join(filtered_words)
    
    def get_singular_form(self, name: str) -> str:
        """Convert plural forms to singular"""
        words = name.split()
        singular_words = []
        
        for word in words:
            singular = self.p.singular_noun(word)
            if singular:
                singular_words.append(singular)
            else:
                singular_words.append(word)
        
        return ' '.join(singular_words)
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Enhanced similarity calculation with fuzzy matching"""
        norm1 = self.normalize_product_name(text1)
        norm2 = self.normalize_product_name(text2)
        
        sing1 = self.get_singular_form(norm1)
        sing2 = self.get_singular_form(norm2)
        
        similarities = []
        
        # 1. Direct string similarity
        similarities.append(SequenceMatcher(None, sing1, sing2).ratio())
        
        # 2. Fuzzy matching - handles typos like "chivari" vs "chiavari"
        fuzzy_ratio = fuzz.ratio(sing1, sing2) / 100.0
        similarities.append(fuzzy_ratio)
        
        # 3. Partial fuzzy matching - handles substring matches
        partial_ratio = fuzz.partial_ratio(sing1, sing2) / 100.0
        similarities.append(partial_ratio)
        
        # 4. Token-based fuzzy matching - handles word order differences
        token_ratio = fuzz.token_sort_ratio(sing1, sing2) / 100.0
        similarities.append(token_ratio)
        
        # 5. Word-based similarity
        words1 = set(sing1.split())
        words2 = set(sing2.split())
        if words1 and words2:
            word_similarity = len(words1.intersection(words2)) / len(words1.union(words2))
            similarities.append(word_similarity)
        
        # 6. Check if one is contained in the other
        if sing1 in sing2 or sing2 in sing1:
            similarities.append(0.8)
        
        # 7. Generic to specific matching
        if len(words1) <= len(words2) and words1.issubset(words2):
            similarities.append(0.9)
        
        # 8. Category-based matching
        category_similarity = self.calculate_category_similarity(sing1, sing2)
        if category_similarity > 0:
            similarities.append(category_similarity)
        
        return max(similarities)
    
    def calculate_category_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity based on product categories"""
        for category, keywords in self.category_keywords.items():
            text1_has_category = any(keyword in text1 for keyword in keywords)
            text2_has_category = any(keyword in text2 for keyword in keywords)
            
            if text1_has_category and text2_has_category:
                return 0.7  # Both are in the same category
        
        return 0
    
    def extract_product_requests(self, email_text: str) -> List[Dict[str, Any]]:
        """Extract product requests from email text"""
        requests = []
        email_lower = email_text.lower()
        
        # Find specific product requests
        for pattern in self.request_patterns:
            matches = re.finditer(pattern, email_lower, re.IGNORECASE)
            for match in matches:
                product_text = match.group(1).strip()
                if len(product_text) > 2:
                    requests.append({
                        'text': product_text,
                        'type': 'product_request',
                        'context': match.group(0),
                        'is_generic': False
                    })
        
        # Find generic inquiries
        for pattern in self.generic_patterns:
            matches = re.finditer(pattern, email_lower, re.IGNORECASE)
            for match in matches:
                product_text = match.group(1).strip()
                if len(product_text) > 2:
                    requests.append({
                        'text': product_text,
                        'type': 'generic_inquiry',
                        'context': match.group(0),
                        'is_generic': True
                    })
        
        # Find quantity mentions
        for pattern in self.quantity_patterns:
            matches = re.finditer(pattern, email_lower, re.IGNORECASE)
            for match in matches:
                try:
                    if match.group(1).isdigit():
                        quantity = int(match.group(1))
                        product_text = match.group(2).strip()
                    else:
                        quantity = int(match.group(2))
                        product_text = match.group(1).strip()
                    
                    if len(product_text) > 2:
                        requests.append({
                            'text': product_text,
                            'type': 'quantity_request',
                            'quantity': quantity,
                            'context': match.group(0),
                            'is_generic': False
                        })
                except (ValueError, IndexError):
                    continue
        
        return requests
    
    def match_inventory(self, requests: List[Dict], inventory: List[Dict], threshold: float = 0.75) -> List[Dict]:
        """Match product requests against inventory with enhanced fuzzy matching"""
        matches = []
        
        for request in requests:
            best_matches = []
            
            # For generic requests, use a lower threshold and broader matching
            current_threshold = threshold * 0.7 if request.get('is_generic', False) else threshold
            
            for item in inventory:
                similarity = self.calculate_similarity(request['text'], item['name'])
                
                if similarity >= current_threshold:
                    best_matches.append({
                        'inventory_item': item,
                        'similarity': similarity,
                        'request': request
                    })
            
            # Sort by similarity
            best_matches.sort(key=lambda x: x['similarity'], reverse=True)
            
            # Handle generic requests differently
            if request.get('is_generic', False):
                # For generic requests, return more items (up to 10)
                for match in best_matches[:10]:
                    matches.append(match)
            else:
                # For specific requests, return top 3 matches
                for match in best_matches[:3]:
                    matches.append(match)
        
        return matches
    
    def generate_inventory_context(self, matches: List[Dict]) -> str:
        """Generate inventory context for the GPT prompt"""
        if not matches:
            return ""
        
        context = "\n\n--- RELEVANT INVENTORY ---\n"
        
        # Group matches by request to avoid repetition
        grouped_matches = {}
        for match in matches:
            request_text = match['request']['text']
            if request_text not in grouped_matches:
                grouped_matches[request_text] = []
            grouped_matches[request_text].append(match)
        
        for request_text, request_matches in grouped_matches.items():
            request_type = request_matches[0]['request']['type']
            
            if request_type == 'generic_inquiry':
                context += f"\nFor the inquiry about '{request_text}', here are our available options:\n"
            else:
                context += f"\nFor '{request_text}':\n"
            
            # Remove duplicates and sort by similarity
            seen_items = set()
            unique_matches = []
            for match in request_matches:
                item_key = f"{match['inventory_item']['name']}_{match['inventory_item']['price']}"
                if item_key not in seen_items:
                    seen_items.add(item_key)
                    unique_matches.append(match)
            
            unique_matches.sort(key=lambda x: x['similarity'], reverse=True)
            
            for match in unique_matches:
                item = match['inventory_item']
                context += f"  • {item['name']}: ${item['price']:.2f}\n"
        
        context += "\nIMPORTANT: When customer asks generically or uses different spellings, show them the available options. Be helpful and ask what they prefer if multiple options exist."
        
        return context

# ─── OpenAI call ──────────────────────────────────────────────────────
def create_draft_with_gpt(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.47,
        max_tokens=500,
    )
    return response.choices[0].message.content.strip()
@router.post("/generate-draft", response_model=DraftResponse)
async def generate_draft(request: Request, email: DraftRequest):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")

    # Fetch user data
    tone = fetch_tone_profile(user_id)
    user_row = supabase.table("users").select("signature", "brand_summary").eq("id", user_id).execute()
    row = user_row.data[0] if user_row.data else {}
    signature_block = row.get("signature", "")
    brand_summary = row.get("brand_summary", "")
    
    # Fetch and match inventory
    inventory_result = supabase.table("inventory").select("*").eq("user_id", user_id).execute()
    inventory = inventory_result.data or []
    
    matcher = InventoryMatcher()
    email_content = f"{email.subject} {email.body}"
    product_requests = matcher.extract_product_requests(email_content)
    inventory_matches = matcher.match_inventory(product_requests, inventory)
    
    # Generate inventory context
    inventory_context = matcher.generate_inventory_context(inventory_matches)
    
    # Prepare matched items for response
    matched_items = []
    for match in inventory_matches:
        matched_items.append({
            'name': match['inventory_item']['name'],
            'price': match['inventory_item']['price'],
            'similarity': match['similarity'],
            'request_text': match['request']['text'],
            'request_type': match['request']['type']
        })
    
    # Determine if we have inventory matches
    has_matches = len(inventory_matches) > 0
    
    # Generate prompt based on whether we have matches
    if has_matches:
        inventory_instructions = """
    - If the customer is asking about products you have in inventory, provide the pricing naturally
    - For generic inquiries, show them what options are available
    - If quantities were mentioned, acknowledge them in your response"""
    else:
        inventory_instructions = """
    - The customer is asking about products you don't currently have in stock or offer
    - Politely let them know you don't have those specific items available
    - Be helpful by suggesting they contact you for custom requests or alternative options
    - Don't make up products or prices - be honest about what you don't have"""
        inventory_context = "\n\n--- INVENTORY STATUS ---\nNo matching products found in current inventory for this request."
    
    prompt = f"""You are writing an email reply for a small business owner.

    Here's how they typically write - match this natural style:
    - Their sentences are usually {tone['communication_patterns']['avg_sentence_length']:.0f} words long
    - They frequently use words like: {', '.join([w for w, _ in tone['top_words']][:5])}
    - They tend to be {tone['politeness_analysis']['communication_style']} in tone
    - They often express {tone['emotional_tone']['dominant_emotion']}
    
    Their brand identity:
    {brand_summary or "No brand information available."}

    {inventory_context}

    INSTRUCTIONS:
    - Write a helpful, natural reply that sounds like a real person
    - Don't be overly enthusiastic or robotic
    - NEVER INCLUDE ANY CLOSING SIGNATURE OR SIGN OFF like Thanks or Best Regards or Warm Regards — that will be handled outside your response
    - Be conversational and match their tone{inventory_instructions}

    —— Incoming email ——
    Subject: {email.subject}
    Body: {email.body}
    """

    # Generate draft
    draft_text = create_draft_with_gpt(prompt)
    
    # Add signature
    if signature_block:
        normalized_signature = signature_block.strip().lower()
        normalized_draft = draft_text.strip().lower()
        if not any(line.strip() in normalized_draft for line in normalized_signature.splitlines() if line.strip()):
            draft_text += f"\n\n{signature_block}"

    # Save draft
    supabase.table("drafts").insert({
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
        "incoming_subject": email.subject,
        "incoming_body": email.body,
        "draft": draft_text,
        # "matched_inventory_count": len(matched_items),  # Uncomment when column exists
        # "inventory_matches": matched_items if matched_items else None  # Uncomment when column exists
    }).execute()

    return DraftResponse(
        draft=draft_text, 
        prompt=prompt,
        matched_inventory=matched_items if matched_items else None
    )



# ─── Testing endpoint ──────────────────────────────────────────────────
@router.post("/test-inventory-matching", response_model=TestInventoryResponse)
async def test_inventory_matching(request: Request, test_request: TestInventoryRequest):
    """Test endpoint to see what inventory information will be provided for an email"""
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")
    
    # Fetch inventory
    inventory_result = supabase.table("inventory").select("*").eq("user_id", user_id).execute()
    inventory = inventory_result.data or []
    
    # Process the email content
    matcher = InventoryMatcher()
    product_requests = matcher.extract_product_requests(test_request.email_content)
    inventory_matches = matcher.match_inventory(product_requests, inventory)
    inventory_context = matcher.generate_inventory_context(inventory_matches)
    
    # Format the response
    matched_items = []
    for match in inventory_matches:
        matched_items.append({
            "request_text": match['request']['text'],
            "request_type": match['request']['type'],
            "matched_product": match['inventory_item']['name'],
            "price": match['inventory_item']['price'],
            "similarity": round(match['similarity'], 3),
            "is_generic": match['request'].get('is_generic', False)
        })
    
    return TestInventoryResponse(
        extracted_requests=product_requests,
        matched_inventory=matched_items,
        inventory_context=inventory_context,
        total_inventory_items=len(inventory)
    )