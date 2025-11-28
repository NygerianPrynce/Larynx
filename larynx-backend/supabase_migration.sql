-- Add email_format_template and email_instructions columns to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_format_template TEXT,
ADD COLUMN IF NOT EXISTS email_instructions TEXT;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN users.email_format_template IS 'Example email template that AI should match for structure and style';
COMMENT ON COLUMN users.email_instructions IS 'Specific instructions for AI to follow when generating emails (e.g., "Start all emails with Hello!")';

