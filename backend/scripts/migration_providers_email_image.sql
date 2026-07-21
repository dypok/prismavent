-- ============================================================
-- MIGRATION: Add email and image_url to providers
-- Ejecutar una sola vez en la DB de Supabase (SQL Editor)
-- ============================================================
ALTER TABLE providers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS image_url TEXT;
