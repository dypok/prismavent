-- ============================================================
-- SEED DATA: provider_categories + providers
-- Minimo 5 proveedores por cada categoria
-- Ejecutar una sola vez en la DB de Supabase (SQL Editor)
-- ============================================================

-- 1. Categorias (6)
INSERT INTO provider_categories (id, name) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Catering'),
  ('c1000000-0000-0000-0000-000000000002', 'Sonido & DJ'),
  ('c1000000-0000-0000-0000-000000000003', 'Decoracion'),
  ('c1000000-0000-0000-0000-000000000004', 'Fotografia'),
  ('c1000000-0000-0000-0000-000000000005', 'Salones'),
  ('c1000000-0000-0000-0000-000000000006', 'Personal')
ON CONFLICT (id) DO NOTHING;

-- 2. Proveedores - Catering (5)
INSERT INTO providers (category_id, city_id, name, description, phone, reference_price, price_unit, rating) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Banquetes del Caribe', 'Catering corporativo y social con menu internacional', '300-1234567', 45000.00, 'por persona', 4.5),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Sabor & Arte Catering', 'Menu caribeno y colombiano autentico', '300-2345678', 38000.00, 'por persona', 4.2),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Chef Premium Events', 'Alta gastronomia para eventos de lujo', '300-3456789', 85000.00, 'por persona', 4.9),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Cocina Fusión LTDA', 'Fusion de sabores colombianos y asiaticos', '300-4567890', 52000.00, 'por persona', 4.3),
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Dulce Tentacion Reposteria', 'Reposteria fina y postres para eventos', '300-5678901', 28000.00, 'por persona', 4.7);

-- 3. Proveedores - Sonido & DJ (5)
INSERT INTO providers (category_id, city_id, name, description, phone, reference_price, price_unit, rating) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'SonidoMaster Pro', 'Equipo de sonido profesional y DJ para todo tipo de eventos', '300-1111111', 800000.00, 'por evento', 4.6),
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Ritmos del Norte DJ', 'DJs especializados en musica latina y vallenato', '300-2222222', 600000.00, 'por evento', 4.4),
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'AudioPro Colombia', 'Alquiler de equipo de sonido y luces', '300-3333333', 1200000.00, 'por evento', 4.8),
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'BeatBox Eventos', 'DJ y produccion musical para bodas y corporativos', '300-4444444', 700000.00, 'por evento', 4.1),
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'SoundWave Systems', 'Tecnologia de audio de ultima generacion', '300-5555555', 950000.00, 'por evento', 4.7);

-- 4. Proveedores - Decoracion (5)
INSERT INTO providers (category_id, city_id, name, description, phone, reference_price, price_unit, rating) VALUES
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Flores & Decoracion Total', 'Decoracion integral con flores naturales y arte floral', '300-6666666', 1500000.00, 'por evento', 4.8),
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Ambienta Eventos', 'Decoracion tematica y ambientacion de espacios', '300-7777777', 2000000.00, 'por evento', 4.5),
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Mundo Floral Events', 'Arte floral y decoracion de mesas para eventos sociales', '300-8888888', 900000.00, 'por evento', 4.3),
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Elegancia Decor', 'Decoracion de lujo para bodas y galas', '300-9999999', 3500000.00, 'por evento', 4.9),
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Castillo de Globos', 'Globos, arcos y decoracion con aire para toda ocasion', '300-1010101', 450000.00, 'por evento', 4.2);

-- 5. Proveedores - Fotografia (5)
INSERT INTO providers (category_id, city_id, name, description, phone, reference_price, price_unit, rating) VALUES
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'Lens Studio Fotografia', 'Fotografia profesional de eventos sociales y corporativos', '300-2020202', 1800000.00, 'por evento', 4.7),
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'Capture Moments', 'Foto y video con drone para eventos', '300-3030303', 2500000.00, 'por evento', 4.9),
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'Pixel Perfect Events', 'Cobertura fotografia y video editado profesional', '300-4040404', 2000000.00, 'por evento', 4.4),
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'Studio Caribe Foto', 'Fotografia artistica y documental de eventos', '300-5050505', 1200000.00, 'por evento', 4.1),
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'FotoPlan 360', 'Fotografia 360 y cabina interactiva para eventos', '300-6060606', 800000.00, 'por evento', 4.6);

-- 6. Proveedores - Salones (5)
INSERT INTO providers (category_id, city_id, name, description, phone, reference_price, price_unit, rating) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'Salon Gran Caribe', 'Salon de eventos para 200-500 personas con vista al mar', '300-7070707', 5000000.00, 'por evento', 4.8),
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'Jardin de Fiesta', 'Espacio al aire libre con jardin y zona techada', '300-8080808', 3500000.00, 'por evento', 4.5),
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'Convention Center Norte', 'Centro de convenciones para eventos corporativos', '300-9090909', 8000000.00, 'por evento', 4.7),
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'Terraza Bella Vista', 'Terraza panoramica para fiestas y cocktail', '300-1212121', 2800000.00, 'por evento', 4.3),
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'Hacienda San Carlos', 'Hacienda colonial para bodas y eventos de campo', '300-1313131', 6500000.00, 'por evento', 4.9);

-- 7. Proveedores - Personal (5)
INSERT INTO providers (category_id, city_id, name, description, phone, reference_price, price_unit, rating) VALUES
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'Staff Profesional Eventos', 'Meseros, bartenders y personal de servicio capacitado', '300-1414141', 25000.00, 'por persona', 4.4),
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'Equipo VIP Services', 'Personal de seguridad y host para eventos premium', '300-1515151', 35000.00, 'por persona', 4.7),
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'Coordinacion Total Events', 'Coordinadores y planificadores de eventos completos', '300-1616161', 500000.00, 'por evento', 4.8),
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'Garson Express', 'Servicio de meseros y bartenders rapidos y profesionales', '300-1717171', 22000.00, 'por persona', 4.2),
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', 'Crew Event Management', 'Equipo completo de logistica y ejecucion de eventos', '300-1818181', 750000.00, 'por evento', 4.6);
