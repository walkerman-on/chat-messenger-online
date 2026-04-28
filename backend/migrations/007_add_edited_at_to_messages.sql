-- Migration: Add edited_at to messages
-- Date: 2024-12-XX

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP NULL;

COMMENT ON COLUMN "messages"."editedAt" IS 'Время последнего редактирования сообщения';

