-- Migration: Add user profile fields (position, department, current project)
-- Date: 2024

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "position" VARCHAR(255) NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" VARCHAR(255) NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_project" VARCHAR(255) NULL;

COMMENT ON COLUMN "users"."position" IS 'Должность пользователя';
COMMENT ON COLUMN "users"."department" IS 'Структурное подразделение';
COMMENT ON COLUMN "users"."current_project" IS 'Текущий проект';

