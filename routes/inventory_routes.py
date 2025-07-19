from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from config import supabase
import pandas as pd
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, validator
from fastapi import HTTPException, UploadFile, File
from io import StringIO, BytesIO
import csv
from difflib import SequenceMatcher
import inflect

router = APIRouter()

class InventoryItem(BaseModel):
    name: str
    price: float

@router.post("/inventory/add")
async def add_inventory_item(request: Request, item: InventoryItem):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")

    result = supabase.table("inventory").insert({
        "user_id": user_id,
        "name": item.name,
        "price": item.price
    }).execute()

    if not result.data:
        raise HTTPException(500, "Failed to add inventory item")

    return {"message": "Item added successfully", "item": result.data[0]}

class BulkInventoryItem(BaseModel):
    name: str
    price: float

    @validator('name')
    def clean_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Product name cannot be empty")
        
        # Clean the name
        cleaned = v.strip()
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        # Remove special characters at start/end
        cleaned = re.sub(r'^[^\w\s]+|[^\w\s]+$', '', cleaned)
        
        if len(cleaned) < 2:
            raise ValueError("Product name must be at least 2 characters")
        if len(cleaned) > 200:
            raise ValueError("Product name too long (max 200 characters)")
            
        return cleaned

    @validator('price')
    def clean_price(cls, v):
        if v <= 0:
            raise ValueError("Price must be positive")
        if v > 1000000:
            raise ValueError("Price too high (max $1,000,000)")
        
        # Round to 2 decimal places
        return round(float(v), 2)

class DuplicateDetector:
    def __init__(self):
        self.p = inflect.engine()
    
    def normalize_name(self, name: str) -> str:
        """Normalize product name for comparison"""
        # Convert to lowercase and remove extra spaces
        normalized = re.sub(r'\s+', ' ', name.lower().strip())
        
        # Remove common punctuation
        normalized = re.sub(r'[^\w\s]', '', normalized)
        
        # Remove common words that don't affect identity
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        words = normalized.split()
        filtered_words = [word for word in words if word not in stop_words]
        
        return ' '.join(filtered_words)
    
    def get_singular_form(self, name: str) -> str:
        """Convert plural forms to singular"""
        words = name.split()
        singular_words = []
        
        for word in words:
            # Try to get singular form
            singular = self.p.singular_noun(word)
            if singular:
                singular_words.append(singular)
            else:
                singular_words.append(word)
        
        return ' '.join(singular_words)
    
    def calculate_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity between two product names"""
        # Normalize both names
        norm1 = self.normalize_name(name1)
        norm2 = self.normalize_name(name2)
        
        # Convert to singular forms
        sing1 = self.get_singular_form(norm1)
        sing2 = self.get_singular_form(norm2)
        
        # Calculate similarity using different methods
        similarities = []
        
        # Direct comparison after normalization
        similarities.append(SequenceMatcher(None, sing1, sing2).ratio())
        
        # Word-based comparison (handles reordering)
        words1 = set(sing1.split())
        words2 = set(sing2.split())
        if words1 and words2:
            word_similarity = len(words1.intersection(words2)) / len(words1.union(words2))
            similarities.append(word_similarity)
        
        # Character-level comparison (handles typos)
        char_similarity = SequenceMatcher(None, sing1.replace(' ', ''), sing2.replace(' ', '')).ratio()
        similarities.append(char_similarity)
        
        # Return the maximum similarity
        return max(similarities)
    
    def find_duplicates(self, new_items: List[Dict], existing_items: List[Dict], 
                       similarity_threshold: float = 0.85) -> Dict[str, Any]:
        """Find duplicates between new items and existing inventory"""
        duplicates = []
        updates = []
        new_items_clean = []
        
        detector = DuplicateDetector()
        
        for new_item in new_items:
            best_match = None
            best_similarity = 0
            
            # Check against existing items
            for existing_item in existing_items:
                similarity = detector.calculate_similarity(
                    new_item['name'], 
                    existing_item['name']
                )
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = existing_item
            
            if best_similarity >= similarity_threshold and best_match:
                # This is likely a duplicate/update
                updates.append({
                    'existing_item': best_match,
                    'new_item': new_item,
                    'similarity': best_similarity,
                    'action': 'update' if new_item['price'] != best_match['price'] else 'skip'
                })
                duplicates.append({
                    'new_name': new_item['name'],
                    'existing_name': best_match['name'],
                    'similarity': best_similarity,
                    'new_price': new_item['price'],
                    'existing_price': best_match['price']
                })
            else:
                # This is a new item
                new_items_clean.append(new_item)
        
        return {
            'duplicates': duplicates,
            'updates': updates,
            'new_items': new_items_clean
        }

class FileProcessor:
    def __init__(self):
        self.name_variations = ['name', 'product_name', 'item_name', 'product', 'item', 'title']
        self.price_variations = ['price', 'cost', 'amount', 'value', 'unit_price']
        self.supported_extensions = ['.csv', '.xlsx', '.xls']
    
    def read_file(self, file_content: bytes, filename: str) -> pd.DataFrame:
        """Read file content based on extension"""
        file_ext = filename.lower().split('.')[-1]
        
        if file_ext == 'csv':
            return self._read_csv(file_content)
        elif file_ext in ['xlsx', 'xls']:
            return self._read_excel(file_content, file_ext)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def _read_csv(self, file_content: bytes) -> pd.DataFrame:
        """Read CSV file content"""
        try:
            # Try UTF-8 first
            content_str = file_content.decode('utf-8')
        except UnicodeDecodeError:
            # Fallback to latin-1 for legacy files
            content_str = file_content.decode('latin-1')
        
        # Clean the content
        cleaned_content = self.clean_csv_content(content_str)
        
        # Try to read CSV with different parameters
        try:
            df = pd.read_csv(StringIO(cleaned_content))
        except:
            # Try with different separator
            df = pd.read_csv(StringIO(cleaned_content), sep=';')
        
        return df
    
    def _read_excel(self, file_content: bytes, file_ext: str) -> pd.DataFrame:
        """Read Excel file content"""
        try:
            # Read Excel file
            excel_file = pd.ExcelFile(BytesIO(file_content))
            
            # Get the first sheet (or specify sheet name if needed)
            sheet_name = excel_file.sheet_names[0]
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Clean column names
            df.columns = df.columns.astype(str).str.strip()
            
            return df
            
        except Exception as e:
            raise ValueError(f"Failed to read Excel file: {str(e)}")
    
    def clean_csv_content(self, content: str) -> str:
        """Clean raw CSV content"""
        # Remove BOM if present
        content = content.replace('\ufeff', '')
        
        # Fix common CSV issues
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Skip empty lines
            if not line.strip():
                continue
            
            # Remove extra quotes and clean up
            line = line.strip()
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def detect_headers(self, df: pd.DataFrame) -> Dict[str, str]:
        """Detect which columns contain name and price"""
        headers = df.columns.str.lower().str.strip()
        mapping = {}
        
        # Find name column
        name_col = None
        for col in headers:
            if any(variation in col for variation in self.name_variations):
                name_col = df.columns[headers.get_loc(col)]
                break
        
        # Find price column
        price_col = None
        for col in headers:
            if any(variation in col for variation in self.price_variations):
                price_col = df.columns[headers.get_loc(col)]
                break
        
        if not name_col:
            raise ValueError("Could not find name/product column. Expected columns like: name, product_name, item_name")
        if not price_col:
            raise ValueError("Could not find price column. Expected columns like: price, cost, amount")
        
        return {"name": name_col, "price": price_col}
    
    def extract_price(self, price_str: Any) -> float:
        """Extract numeric price from string"""
        if pd.isna(price_str):
            raise ValueError("Price cannot be empty")
        
        # Convert to string and clean
        price_str = str(price_str).strip()
        
        # Remove currency symbols and common prefixes
        price_str = re.sub(r'[$€£¥₹]', '', price_str)
        price_str = re.sub(r'[,\s]', '', price_str)
        
        # Extract number
        match = re.search(r'(\d+\.?\d*)', price_str)
        if not match:
            raise ValueError(f"Invalid price format: {price_str}")
        
        return float(match.group(1))
    
    def process_file(self, file_content: bytes, filename: str) -> List[Dict[str, Any]]:
        """Process file content and return cleaned data"""
        try:
            # Read file based on extension
            df = self.read_file(file_content, filename)
            
            if df.empty:
                raise ValueError("File is empty")
            
            # Remove completely empty rows
            df = df.dropna(how='all')
            
            if df.empty:
                raise ValueError("File contains no data rows")
            
            # Detect headers
            header_mapping = self.detect_headers(df)
            
            # Extract and clean data
            cleaned_items = []
            errors = []
            
            for idx, row in df.iterrows():
                try:
                    name = str(row[header_mapping["name"]]).strip()
                    if not name or name.lower() in ['nan', 'null', '', 'none']:
                        errors.append(f"Row {idx + 2}: Missing product name")
                        continue
                    
                    price = self.extract_price(row[header_mapping["price"]])
                    
                    cleaned_items.append({
                        "name": name,
                        "price": price,
                        "row": idx + 2
                    })
                    
                except Exception as e:
                    errors.append(f"Row {idx + 2}: {str(e)}")
            
            if errors:
                error_msg = "File processing errors:\n" + "\n".join(errors[:10])
                if len(errors) > 10:
                    error_msg += f"\n... and {len(errors) - 10} more errors"
                raise ValueError(error_msg)
            
            return cleaned_items
            
        except Exception as e:
            raise ValueError(f"Failed to process file: {str(e)}")
    
    def get_file_info(self, filename: str) -> Dict[str, str]:
        """Get file information for validation"""
        file_ext = filename.lower().split('.')[-1]
        return {
            "extension": file_ext,
            "type": "Excel" if file_ext in ['xlsx', 'xls'] else "CSV",
            "supported": file_ext in [ext.lstrip('.') for ext in self.supported_extensions]
        }

# Updated endpoint with upsert functionality
@router.post("/inventory/bulk-upload")
async def bulk_upload_inventory(request: Request, file: UploadFile = File(...)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")
    
    # Get file info
    processor = FileProcessor()
    file_info = processor.get_file_info(file.filename)
    
    # Validate file type
    if not file_info["supported"]:
        supported_types = ", ".join(processor.supported_extensions)
        raise HTTPException(400, f"Unsupported file type. Supported formats: {supported_types}")
    
    # File size limits (Excel files can be larger)
    max_size = 10 * 1024 * 1024 if file_info["extension"] in ['xlsx', 'xls'] else 5 * 1024 * 1024
    if file.size > max_size:
        max_mb = max_size // (1024 * 1024)
        raise HTTPException(400, f"File too large (max {max_mb}MB for {file_info['type']} files)")
    
    try:
        # Read file content
        content = await file.read()
        
        # Process file
        raw_items = processor.process_file(content, file.filename)
        
        # Validate items using Pydantic
        validated_items = []
        validation_errors = []
        
        for item in raw_items:
            try:
                validated_item = BulkInventoryItem(
                    name=item["name"],
                    price=item["price"]
                )
                validated_items.append({
                    "name": validated_item.name,
                    "price": validated_item.price,
                    "row": item["row"]
                })
            except Exception as e:
                validation_errors.append(f"Row {item['row']}: {str(e)}")
        
        if validation_errors:
            error_msg = "Validation errors:\n" + "\n".join(validation_errors[:10])
            if len(validation_errors) > 10:
                error_msg += f"\n... and {len(validation_errors) - 10} more errors"
            raise HTTPException(400, error_msg)
        
        if not validated_items:
            raise HTTPException(400, "No valid items found in file")
        
        # Get existing inventory for duplicate detection
        existing_result = supabase.table("inventory").select("*").eq("user_id", user_id).execute()
        existing_items = existing_result.data or []
        
        # Find duplicates and determine actions
        detector = DuplicateDetector()
        analysis = detector.find_duplicates(validated_items, existing_items)
        
        # Perform database operations
        inserted_count = 0
        updated_count = 0
        skipped_count = 0
        
        # Insert new items
        if analysis['new_items']:
            new_records = [{"user_id": user_id, "name": item["name"], "price": item["price"]} 
                          for item in analysis['new_items']]
            insert_result = supabase.table("inventory").insert(new_records).execute()
            inserted_count = len(insert_result.data) if insert_result.data else 0
        
        # Update existing items
        for update_info in analysis['updates']:
            if update_info['action'] == 'update':
                existing_item = update_info['existing_item']
                new_item = update_info['new_item']
                
                # Update the existing item
                update_result = supabase.table("inventory").update({
                    "price": new_item['price']
                }).eq("id", existing_item['id']).execute()
                
                if update_result.data:
                    updated_count += 1
            else:
                skipped_count += 1
        
        # Prepare response
        response = {
            "message": f"Upload completed: {inserted_count} new items, {updated_count} updated, {skipped_count} skipped",
            "summary": {
                "new_items": inserted_count,
                "updated_items": updated_count,
                "skipped_items": skipped_count,
                "total_processed": len(validated_items)
            },
            "file_info": {
                "name": file.filename,
                "type": file_info["type"],
                "processed_rows": len(validated_items)
            }
        }
        
        # Add duplicate details if any were found
        if analysis['duplicates']:
            response["duplicates_found"] = analysis['duplicates']
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Error processing {file_info['type']} file: {str(e)}")

# Optional: Add an endpoint to adjust similarity threshold
@router.post("/inventory/set-duplicate-threshold")
async def set_duplicate_threshold(request: Request, threshold: float):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")
    
    if not 0.1 <= threshold <= 1.0:
        raise HTTPException(400, "Threshold must be between 0.1 and 1.0")
    
    # Store user preference (you might want to add this to user settings in database)
    # For now, this is just a placeholder
    return {"message": f"Duplicate detection threshold set to {threshold}"}


@router.get("/inventory")
async def get_inventory(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")

    result = supabase.table("inventory").select("*").eq("user_id", user_id).execute()

    return {"inventory": result.data}

class InventoryUpdate(BaseModel):
    name: Optional[str]
    price: Optional[float]

@router.put("/inventory/edit/{item_id}")
async def update_inventory_item(item_id: str, request: Request, update: InventoryUpdate):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")

    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "No data provided for update")

    result = supabase.table("inventory").update(update_data).eq("id", item_id).eq("user_id", user_id).execute()

    if not result.data:
        raise HTTPException(500, "Failed to update item")

    return {"message": "Item updated", "item": result.data[0]}

@router.delete("/inventory/delete/{item_id}")
async def delete_inventory_item(item_id: str, request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authenticated")

    result = supabase.table("inventory").delete().eq("id", item_id).eq("user_id", user_id).execute()

    if not result.data:
        raise HTTPException(500, "Failed to delete item")

    return {"message": "Item deleted"}

class SpecialInstructions(BaseModel):
    special_instructions: str

@router.post("/inventory/special-instructions")
async def save_special_instructions(request: Request, data: SpecialInstructions):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = supabase.table("users").update({
        "special_instructions": data.special_instructions
    }).eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save instructions")

    return {"message": "Special instructions saved"}

@router.get("/inventory/special-instructions")
async def get_special_instructions(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = supabase.table("users").select("special_instructions").eq("id", user_id).single().execute()

    return {"special_instructions": result.data.get("special_instructions", "")}
