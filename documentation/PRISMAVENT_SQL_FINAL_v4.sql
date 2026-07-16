-- ============================================================
-- PRISMAVENT — SQL FINAL v5
-- PostgreSQL 15+ (Supabase)
-- Basado en SQL FINAL v4 + icon_url en templates + nuevas plantillas
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('borrador', 'planificando', 'confirmado', 'finalizado');
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
  event_date DATE NOT NULL,
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

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

DROP TRIGGER IF EXISTS trg_events_validate_user_template_owner ON events;
CREATE TRIGGER trg_events_validate_user_template_owner
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION validate_user_template_owner();

-- ============================================================
-- DATOS INICIALES — event_types (4 originales + 6 nuevos)
-- ============================================================
INSERT INTO event_types (id, name, description, color_bg, color_icon) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'boda',          'Bodas y ceremonias',                          '#fff1f2', '#be185d'),
  ('a1000000-0000-0000-0000-000000000002', 'cumpleaños',    'Cumpleaños y fiestas',                        '#fdf2f8', '#db2777'),
  ('a1000000-0000-0000-0000-000000000003', 'tech',          'Eventos tecnológicos y corporativos',         '#eff6ff', '#2563eb'),
  ('a1000000-0000-0000-0000-000000000004', 'personalizado', 'Evento personalizado',                        '#f0fdf4', '#16a34a'),
  ('a1000000-0000-0000-0000-000000000005', 'quinceañera',   'Quinceañeras y celebraciones de 15 años',    '#fdf4ff', '#a21caf'),
  ('a1000000-0000-0000-0000-000000000006', 'graduacion',    'Graduaciones y ceremonias académicas',        '#f0fdf4', '#15803d'),
  ('a1000000-0000-0000-0000-000000000007', 'corporativo',   'Eventos corporativos y de empresa',           '#eff6ff', '#1d4ed8'),
  ('a1000000-0000-0000-0000-000000000008', 'aniversario',   'Aniversarios y celebraciones de pareja',      '#fff7ed', '#c2410c'),
  ('a1000000-0000-0000-0000-000000000009', 'retiro',        'Retiros, convivencias y team building',       '#f0fdfa', '#0f766e'),
  ('a1000000-0000-0000-0000-000000000010', 'infantil',      'Fiestas infantiles y temáticas para niños',  '#fefce8', '#a16207')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- DATOS INICIALES — templates (4 originales + 6 nuevas)
-- icon_url usa la API de Iconify (Lucide icons, licencia MIT)
-- Patrón: https://api.iconify.design/lucide/<icon>.svg?color=%23<hex>
-- ============================================================
INSERT INTO templates (id, event_type_id, name, description, icon_url, default_items) VALUES

-- Boda
(
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Plantilla Boda',
  'Plantilla base para bodas y ceremonias',
  'https://api.iconify.design/lucide/heart.svg?color=%23be185d',
  '[
    {"name": "Catering", "quantity": 1, "reference_price": 3500000},
    {"name": "Decoración floral", "quantity": 1, "reference_price": 1200000},
    {"name": "Sonido y DJ", "quantity": 1, "reference_price": 1500000},
    {"name": "Fotografía", "quantity": 1, "reference_price": 2000000},
    {"name": "Salón de eventos", "quantity": 1, "reference_price": 4000000},
    {"name": "Torta de bodas", "quantity": 1, "reference_price": 800000},
    {"name": "Transporte de novios", "quantity": 1, "reference_price": 600000}
  ]'::jsonb
),

-- Cumpleaños
(
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'Plantilla Cumpleaños',
  'Plantilla base para cumpleaños y fiestas',
  'https://api.iconify.design/lucide/cake.svg?color=%23db2777',
  '[
    {"name": "Catering / Comida", "quantity": 1, "reference_price": 1200000},
    {"name": "Decoración y globos", "quantity": 1, "reference_price": 400000},
    {"name": "Sonido y parlantes", "quantity": 1, "reference_price": 500000},
    {"name": "Torta", "quantity": 1, "reference_price": 350000},
    {"name": "Fotografía", "quantity": 1, "reference_price": 800000}
  ]'::jsonb
),

-- Tech
(
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000003',
  'Plantilla Tech',
  'Plantilla base para eventos tecnológicos y corporativos',
  'https://api.iconify.design/lucide/laptop.svg?color=%232563eb',
  '[
    {"name": "Alquiler de salón", "quantity": 1, "reference_price": 2500000},
    {"name": "Equipos audiovisuales", "quantity": 1, "reference_price": 1800000},
    {"name": "Catering / Coffee break", "quantity": 1, "reference_price": 900000},
    {"name": "Impresión de credenciales", "quantity": 1, "reference_price": 250000},
    {"name": "Streaming / grabación", "quantity": 1, "reference_price": 1200000},
    {"name": "Conectividad WiFi", "quantity": 1, "reference_price": 400000}
  ]'::jsonb
),

-- Personalizado (plantilla interna — se filtra del grid)
(
  'b1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000004',
  'Plantilla Personalizado',
  'Plantilla vacía para eventos hechos a medida',
  'https://api.iconify.design/lucide/pencil.svg?color=%2316a34a',
  '[]'::jsonb
),

-- Quinceañera
(
  'b1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000005',
  'Plantilla Quinceañera',
  'Estructura completa para quinceañeras con vals, misa y recepción',
  'https://api.iconify.design/lucide/sparkles.svg?color=%23a21caf',
  '[
    {"name": "Salón de eventos", "quantity": 1, "reference_price": 3500000},
    {"name": "Catering / Banquete", "quantity": 1, "reference_price": 2800000},
    {"name": "Decoración y centros de mesa", "quantity": 1, "reference_price": 1500000},
    {"name": "Vestido de quinceañera", "quantity": 1, "reference_price": 2000000},
    {"name": "Torta temática", "quantity": 1, "reference_price": 700000},
    {"name": "Fotografía y video", "quantity": 1, "reference_price": 2500000},
    {"name": "Sonido y DJ", "quantity": 1, "reference_price": 1200000},
    {"name": "Chambelanes (coreografía)", "quantity": 1, "reference_price": 800000},
    {"name": "Invitaciones", "quantity": 100, "reference_price": 3000},
    {"name": "Transporte", "quantity": 1, "reference_price": 500000}
  ]'::jsonb
),

-- Graduación
(
  'b1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000006',
  'Plantilla Graduación',
  'Celebración de grado universitario o bachillerato con familia y amigos',
  'https://api.iconify.design/lucide/graduation-cap.svg?color=%2315803d',
  '[
    {"name": "Salón / espacio para reunión", "quantity": 1, "reference_price": 1200000},
    {"name": "Catering / Almuerzo o cena", "quantity": 1, "reference_price": 1500000},
    {"name": "Decoración temática", "quantity": 1, "reference_price": 600000},
    {"name": "Torta de graduación", "quantity": 1, "reference_price": 400000},
    {"name": "Fotografía", "quantity": 1, "reference_price": 900000},
    {"name": "Traje / Toga y birrete (alquiler)", "quantity": 1, "reference_price": 250000},
    {"name": "Invitaciones", "quantity": 50, "reference_price": 3000},
    {"name": "Sonido / Parlantes", "quantity": 1, "reference_price": 300000}
  ]'::jsonb
),

-- Corporativo
(
  'b1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000007',
  'Plantilla Corporativo',
  'Lanzamientos de producto, conferencias, reuniones de empresa y keynotes',
  'https://api.iconify.design/lucide/briefcase.svg?color=%231d4ed8',
  '[
    {"name": "Alquiler de auditorio / salón", "quantity": 1, "reference_price": 4000000},
    {"name": "Equipos audiovisuales (proyector, pantallas)", "quantity": 1, "reference_price": 2000000},
    {"name": "Sistema de sonido profesional", "quantity": 1, "reference_price": 1500000},
    {"name": "Catering ejecutivo", "quantity": 1, "reference_price": 1800000},
    {"name": "Impresión de materiales (brochures, credenciales)", "quantity": 1, "reference_price": 500000},
    {"name": "Streaming y grabación", "quantity": 1, "reference_price": 2000000},
    {"name": "Conectividad WiFi empresarial", "quantity": 1, "reference_price": 600000},
    {"name": "Montaje y decoración corporativa", "quantity": 1, "reference_price": 800000},
    {"name": "Recepcionistas / Personal de apoyo", "quantity": 2, "reference_price": 400000},
    {"name": "Transporte ejecutivo", "quantity": 1, "reference_price": 700000}
  ]'::jsonb
),

-- Aniversario
(
  'b1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000008',
  'Plantilla Aniversario',
  'Celebración romántica de aniversario de pareja con cena y sorpresas',
  'https://api.iconify.design/lucide/heart-handshake.svg?color=%23c2410c',
  '[
    {"name": "Cena romántica / Restaurante privado", "quantity": 1, "reference_price": 800000},
    {"name": "Decoración romántica (velas, rosas)", "quantity": 1, "reference_price": 600000},
    {"name": "Fotografía o videógrafo", "quantity": 1, "reference_price": 1200000},
    {"name": "Torta o postre especial", "quantity": 1, "reference_price": 300000},
    {"name": "Músico en vivo o serenata", "quantity": 1, "reference_price": 700000},
    {"name": "Hospedaje / Hotel", "quantity": 1, "reference_price": 500000},
    {"name": "Transporte especial", "quantity": 1, "reference_price": 300000}
  ]'::jsonb
),

-- Retiro / Team Building
(
  'b1000000-0000-0000-0000-000000000009',
  'a1000000-0000-0000-0000-000000000009',
  'Plantilla Retiro',
  'Retiros empresariales, convivencias y actividades de team building',
  'https://api.iconify.design/lucide/tent.svg?color=%230f766e',
  '[
    {"name": "Alojamiento / Finca o cabaña", "quantity": 1, "reference_price": 3000000},
    {"name": "Alimentación (3 comidas x día)", "quantity": 1, "reference_price": 1500000},
    {"name": "Actividades de team building", "quantity": 1, "reference_price": 1200000},
    {"name": "Facilitador / Coach", "quantity": 1, "reference_price": 1000000},
    {"name": "Transporte de ida y vuelta", "quantity": 1, "reference_price": 900000},
    {"name": "Materiales de trabajo / Papelería", "quantity": 1, "reference_price": 300000},
    {"name": "Actividades recreativas (renting, deportes)", "quantity": 1, "reference_price": 600000}
  ]'::jsonb
),

-- Fiesta Infantil
(
  'b1000000-0000-0000-0000-000000000010',
  'a1000000-0000-0000-0000-000000000010',
  'Plantilla Infantil',
  'Fiesta temática para niños con animación, juegos y decoración colorida',
  'https://api.iconify.design/lucide/gamepad-2.svg?color=%23a16207',
  '[
    {"name": "Salón o jardín para niños", "quantity": 1, "reference_price": 900000},
    {"name": "Animador / Payaso / Mago", "quantity": 1, "reference_price": 700000},
    {"name": "Decoración temática", "quantity": 1, "reference_price": 600000},
    {"name": "Torta temática para niños", "quantity": 1, "reference_price": 400000},
    {"name": "Comida y snacks", "quantity": 1, "reference_price": 800000},
    {"name": "Piñata y dulces", "quantity": 1, "reference_price": 200000},
    {"name": "Recuerdos / Bolsas de sorpresas", "quantity": 30, "reference_price": 15000},
    {"name": "Inflables o juegos", "quantity": 1, "reference_price": 500000},
    {"name": "Fotografía", "quantity": 1, "reference_price": 600000}
  ]'::jsonb
)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NOTA PARA AGREGAR NUEVAS PLANTILLAS
-- ============================================================
-- 1. Inserta un nuevo event_type si el tipo no existe.
-- 2. Inserta la plantilla con un UUID nuevo y el icon_url deseado.
--    Patrón de icon_url con Iconify (sin instalar dependencias):
--      https://api.iconify.design/lucide/<nombre-icono>.svg?color=%23<hex-sin-#>
--    Catálogo: https://lucide.dev/icons/
-- 3. Agrega los default_items en formato JSON.
-- 4. El frontend detecta icon_url automáticamente y muestra el SVG.
--    Si icon_url es NULL, usa un emoji de fallback.
-- ============================================================
