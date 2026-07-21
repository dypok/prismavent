-- ============================================================
-- MIGRATION: provider_reviews table, indexes, and rating trigger
-- Ejecutar una sola vez en la DB de Supabase (SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating BETWEEN 0 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider_id
  ON provider_reviews(provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_user_id
  ON provider_reviews(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_reviews_provider_user_unique
  ON provider_reviews(provider_id, user_id);

CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.provider_id, OLD.provider_id);

  UPDATE providers p
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM provider_reviews
    WHERE provider_id = target_id
  )
  WHERE p.id = target_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_provider_reviews_update_rating ON provider_reviews;
CREATE TRIGGER trg_provider_reviews_update_rating
AFTER INSERT OR UPDATE OR DELETE ON provider_reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();
