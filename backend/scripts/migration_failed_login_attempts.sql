-- ============================================================
-- MIGRATION: failed_login_attempts table
-- Registra intentos fallidos de login para auditoría
-- Ejecutar una sola vez en la DB de Supabase (SQL Editor)
-- ============================================================
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip
  ON failed_login_attempts(ip_address, attempted_at);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email
  ON failed_login_attempts(email, attempted_at);
