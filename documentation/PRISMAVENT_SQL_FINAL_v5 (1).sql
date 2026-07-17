-- ============================================================
-- PRISMAVENT — SQL FINAL v5 (unificado)
-- PostgreSQL 15+ (Supabase)
-- guests + event_tasks en un solo esquema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('borrador', 'planificando', 'confirmado', 'in_progress', 'done', 'finalizado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visibility_status AS ENUM ('active', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- CIUDADES Y PERFIL
-- ============================

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT,
  country TEXT NOT NULL DEFAULT 'Colombia',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, department, country)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- TIPOS DE EVENTO Y PLANTILLAS
-- ============================

CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_bg TEXT,
  color_icon TEXT
);

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,                        -- URL de icono SVG para la tarjeta de selección
  default_items JSONB NOT NULL DEFAULT '[]'
);

-- Migración: añadir icon_url si la tabla ya existe
ALTER TABLE templates ADD COLUMN IF NOT EXISTS icon_url TEXT;

CREATE TABLE IF NOT EXISTS user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  source_template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- PROVEEDORES
-- ============================

CREATE TABLE IF NOT EXISTS provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES provider_categories(id) ON DELETE RESTRICT,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  website TEXT,
  address TEXT,
  reference_price DECIMAL(12,2) CHECK (reference_price >= 0),
  price_unit VARCHAR(30),
  rating DECIMAL(2,1) CHECK (rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- EVENTOS
-- ============================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  city_custom TEXT,
  event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  user_template_id UUID REFERENCES user_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  duration INTEGER DEFAULT 0,
  event_date TIMESTAMPTZ NOT NULL,
  guest_count INT NOT NULL DEFAULT 0 CHECK (guest_count >= 0),
  max_budget DECIMAL(12,2) CHECK (max_budget >= 0),
  status event_status NOT NULL DEFAULT 'borrador',
  visibility_status visibility_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (template_id IS NOT NULL AND user_template_id IS NULL)
    OR
    (template_id IS NULL AND user_template_id IS NOT NULL)
    OR
    (template_id IS NULL AND user_template_id IS NULL)
  ),
  CHECK (
    (city_id IS NOT NULL AND city_custom IS NULL)
    OR
    (city_id IS NULL AND city_custom IS NOT NULL)
    OR
    (city_id IS NULL AND city_custom IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS event_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  provider_name TEXT,
  category_name TEXT,
  name TEXT NOT NULL,
  unit TEXT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  notes VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  previous_status event_status,
  new_status event_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- INVITADOS (guests)
-- ============================

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- TAREAS POR EVENTO (event_tasks)
-- ============================

CREATE TABLE IF NOT EXISTS event_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_event_tasks_status
    CHECK (status IN ('todo', 'in_progress', 'done')),
  CONSTRAINT chk_event_tasks_priority
    CHECK (priority IN ('low', 'medium', 'high'))
);

-- ============================
-- FUNCIONES / TRIGGERS
-- ============================

CREATE OR REPLACE FUNCTION validate_user_template_owner()
RETURNS TRIGGER AS $$
DECLARE
  template_owner UUID;
BEGIN
  IF NEW.user_template_id IS NOT NULL THEN
    SELECT user_id INTO template_owner
    FROM user_templates
    WHERE id = NEW.user_template_id;

    IF template_owner IS NULL THEN
      RAISE EXCEPTION 'user_template_id no existe';
    END IF;

    IF template_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'El user_template_id no pertenece al usuario del evento';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_templates_updated_at ON user_templates;
CREATE TRIGGER trg_user_templates_updated_at
BEFORE UPDATE ON user_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_guests_updated_at ON guests;
CREATE TRIGGER trg_guests_updated_at
BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_event_tasks_updated_at ON event_tasks;
CREATE TRIGGER trg_event_tasks_updated_at
BEFORE UPDATE ON event_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger de validación de user_template_owner
DROP TRIGGER IF EXISTS trg_events_validate_user_template_owner ON events;
CREATE TRIGGER trg_events_validate_user_template_owner
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION validate_user_template_owner();

-- ============================
-- ÍNDICES
-- ============================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_status ON events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_events_user_event_date ON events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_events_city_id ON events(city_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility_status ON events(visibility_status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_event_items_event_id ON event_items(event_id);
CREATE INDEX IF NOT EXISTS idx_event_items_confirmed ON event_items(event_id, confirmed);

CREATE INDEX IF NOT EXISTS idx_event_history_event_id ON event_history(event_id);

CREATE INDEX IF NOT EXISTS idx_providers_city_id ON providers(city_id);
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON providers(category_id);

CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_event_confirmed ON guests(event_id, confirmed);
CREATE INDEX IF NOT EXISTS idx_guests_full_name ON guests(full_name);

CREATE INDEX IF NOT EXISTS idx_event_tasks_event_id ON event_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tasks_status ON event_tasks(status);
CREATE INDEX IF NOT EXISTS idx_event_tasks_event_status ON event_tasks(event_id, status);