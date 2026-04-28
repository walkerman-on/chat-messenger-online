-- Migration: Add two-factor authentication fields to users table
-- Date: 2024

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_secret" VARCHAR(255) NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN "users"."two_factor_secret" IS 'TOTP secret для двухфакторной аутентификации';
COMMENT ON COLUMN "users"."two_factor_enabled" IS 'Включена ли двухфакторная аутентификация';


