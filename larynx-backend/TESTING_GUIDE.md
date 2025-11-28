# Testing Guide for Email Format Template & Instructions

## 1. Database Setup

Run the SQL migration in Supabase SQL Editor:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_format_template TEXT,
ADD COLUMN IF NOT EXISTS email_instructions TEXT;
```

Or use the provided file: `supabase_migration.sql`

## 2. Test the Settings Page

1. Navigate to `/settings` (or your settings page route)
2. You should see two new sections:
   - **Email Format Template** - with a "Save Format Template" button
   - **Email Instructions** - with a "Save Instructions" button
3. Fill in both fields and click the save buttons
4. You should see success messages appear

## 3. Test the Prompt Preview Endpoint

Use this endpoint to see the full prompt that will be sent to GPT:

**Endpoint:** `POST /test-prompt-preview`

**Request Body:**
```json
{
  "subject": "Test email subject",
  "body": "Test email body content"
}
```

**Response:**
```json
{
  "prompt": "Full prompt text that would be sent to GPT...",
  "email_format_template": "Your template or '(not set)'",
  "email_instructions": "Your instructions or '(not set)'",
  "brand_summary": "Your brand summary or '(not set)'"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:8000/test-prompt-preview \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "subject": "Inquiry about pricing",
    "body": "Hi, I would like to know the price for your services."
  }'
```

**Example using JavaScript (in browser console on your site):**
```javascript
const api = 'http://localhost:8000'; // or your API URL
const response = await fetch(`${api}/test-prompt-preview`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    subject: "Inquiry about pricing",
    body: "Hi, I would like to know the price for your services."
  })
});
const data = await response.json();
console.log('Full Prompt:', data.prompt);
console.log('Format Template:', data.email_format_template);
console.log('Instructions:', data.email_instructions);
```

## 4. Test the Actual Email Generation

1. Set up your email format template and instructions in settings
2. Use the `/generate-draft` endpoint (or your normal email generation flow)
3. Check that the generated email follows your template structure and instructions

## 5. What to Look For

- **Email Format Template**: The generated email should match the structure, greeting style, and formatting of your example
- **Email Instructions**: The generated email should follow your specific rules (e.g., starting with "Hello!" if that's your instruction)

