-- Migration: Add forwarded_from_id to messages
-- Date: 2024-07-29T14:00:00Z

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "forwarded_from_id" UUID NULL;

ALTER TABLE "messages" ADD CONSTRAINT IF NOT EXISTS "FK_messages_forwarded_from" 
    FOREIGN KEY ("forwarded_from_id") REFERENCES "messages"("id") ON DELETE SET NULL;

COMMENT ON COLUMN "messages"."forwarded_from_id" IS 'ID оригинального сообщения, если это пересланное сообщение';

