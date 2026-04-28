-- Migration: Add securityLevel column to chats table
-- Date: 2024

-- Add securityLevel column with default value 'none'
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS security_level VARCHAR(20) DEFAULT 'none' NOT NULL;

-- Create enum constraint (PostgreSQL doesn't support native enums in this way, so we use CHECK constraint)
ALTER TABLE chats 
ADD CONSTRAINT check_security_level 
CHECK (security_level IN ('none', 'commercial', 'state'));

-- Update existing chats to have 'none' as default if NULL
UPDATE chats 
SET security_level = 'none' 
WHERE security_level IS NULL;

-- Add comment to column
COMMENT ON COLUMN chats.security_level IS 'Уровень секретности чата: none - без грифа, commercial - коммерческая тайна, state - гос. тайна';

