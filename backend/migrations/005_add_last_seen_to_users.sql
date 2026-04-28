-- Add lastSeen column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP NULL;

-- Update existing offline users with current timestamp as lastSeen
UPDATE users SET "lastSeen" = NOW() WHERE status = 'offline' AND "lastSeen" IS NULL;

