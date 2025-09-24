-- Datos de prueba para el Sistema de Gastos y Viáticos

-- Insertar Empresas (México y España)
INSERT OR IGNORE INTO companies (id, name, country, primary_currency, tax_id, address, active) VALUES 
  (1, 'TechMX Solutions', 'MX', 'MXN', 'TMX123456789', 'Av. Reforma 123, CDMX, México', TRUE),
  (2, 'Innovación Digital MX', 'MX', 'MXN', 'IDM987654321', 'Blvd. Independencia 456, Guadalajara, México', TRUE),
  (3, 'Consultoría Estratégica MX', 'MX', 'MXN', 'CEM555666777', 'Calle Juárez 789, Monterrey, México', TRUE),
  (4, 'TechES Barcelona', 'ES', 'EUR', 'B-12345678', 'Passeig de Gràcia 100, Barcelona, España', TRUE),
  (5, 'Innovación Madrid SL', 'ES', 'EUR', 'B-87654321', 'Gran Vía 25, Madrid, España', TRUE),
  (6, 'Digital Valencia S.A.', 'ES', 'EUR', 'A-11223344', 'Calle Colón 50, Valencia, España', TRUE);

-- Insertar Tipos de Gastos
INSERT OR IGNORE INTO expense_types (id, name, description, category, active) VALUES 
  (1, 'Comidas de Trabajo', 'Gastos en restaurantes por reuniones de trabajo', 'meals', TRUE),
  (2, 'Transporte Terrestre', 'Taxis, Uber, autobuses, metro', 'transport', TRUE),
  (3, 'Combustible', 'Gasolina y gastos de vehículos', 'transport', TRUE),
  (4, 'Hospedaje', 'Hoteles y alojamientos', 'accommodation', TRUE),
  (5, 'Vuelos', 'Boletos de avión nacionales e internacionales', 'travel', TRUE),
  (6, 'Material de Oficina', 'Papelería, suministros de oficina', 'supplies', TRUE),
  (7, 'Software y Licencias', 'Suscripciones y licencias de software', 'services', TRUE),
  (8, 'Capacitación', 'Cursos, conferencias, workshops', 'services', TRUE),
  (9, 'Marketing', 'Publicidad, eventos, promociones', 'services', TRUE),
  (10, 'Otros Gastos', 'Gastos diversos no categorizados', 'general', TRUE);

-- Insertar Usuarios de prueba
INSERT OR IGNORE INTO users (id, email, name, password_hash, role, active, last_login) VALUES 
  (1, 'admin@techmx.com', 'Alejandro Rodríguez', '$2b$10$example_hash_admin', 'admin', TRUE, '2024-09-24 10:00:00'),
  (2, 'maria.lopez@techmx.com', 'María López', '$2b$10$example_hash_user1', 'editor', TRUE, '2024-09-24 09:30:00'),
  (3, 'carlos.martinez@innovacion.mx', 'Carlos Martínez', '$2b$10$example_hash_user2', 'advanced', TRUE, '2024-09-24 08:45:00'),
  (4, 'ana.garcia@consultoria.mx', 'Ana García', '$2b$10$example_hash_user3', 'editor', TRUE, '2024-09-24 11:15:00'),
  (5, 'pedro.sanchez@techespana.es', 'Pedro Sánchez', '$2b$10$example_hash_user4', 'advanced', TRUE, '2024-09-24 07:20:00'),
  (6, 'elena.torres@madrid.es', 'Elena Torres', '$2b$10$example_hash_user5', 'editor', TRUE, '2024-09-24 12:00:00'),
  (7, 'viewer@test.com', 'Usuario Solo Lectura', '$2b$10$example_hash_viewer', 'viewer', TRUE, NULL);

-- Asignar usuarios a empresas con permisos
INSERT OR IGNORE INTO user_companies (user_id, company_id, can_view, can_edit, can_admin) VALUES 
  -- Admin tiene acceso total a todas las empresas
  (1, 1, TRUE, TRUE, TRUE),
  (1, 2, TRUE, TRUE, TRUE),
  (1, 3, TRUE, TRUE, TRUE),
  (1, 4, TRUE, TRUE, TRUE),
  (1, 5, TRUE, TRUE, TRUE),
  (1, 6, TRUE, TRUE, TRUE),
  
  -- Usuarios mexicanos
  (2, 1, TRUE, TRUE, FALSE), -- María en TechMX
  (3, 2, TRUE, TRUE, FALSE), -- Carlos en Innovación Digital
  (4, 3, TRUE, TRUE, FALSE), -- Ana en Consultoría Estratégica
  
  -- Usuarios españoles
  (5, 4, TRUE, TRUE, FALSE), -- Pedro en TechES Barcelona
  (6, 5, TRUE, TRUE, FALSE), -- Elena en Innovación Madrid
  
  -- Usuario viewer solo puede ver algunas empresas
  (7, 1, TRUE, FALSE, FALSE),
  (7, 4, TRUE, FALSE, FALSE);

-- Insertar tipos de cambio históricos
INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, rate_date, source) VALUES 
  ('USD', 'MXN', 18.25, '2024-09-24', 'banxico'),
  ('EUR', 'MXN', 20.15, '2024-09-24', 'banxico'),
  ('EUR', 'USD', 1.10, '2024-09-24', 'ecb'),
  ('USD', 'EUR', 0.91, '2024-09-24', 'ecb'),
  ('MXN', 'USD', 0.055, '2024-09-24', 'banxico'),
  ('MXN', 'EUR', 0.050, '2024-09-24', 'banxico');

-- Insertar gastos de ejemplo
INSERT OR IGNORE INTO expenses (
  id, company_id, user_id, expense_type_id, description, expense_date, 
  amount, currency, exchange_rate, amount_mxn, payment_method, vendor, 
  status, notes, is_billable, created_by
) VALUES 
  -- Gastos en MXN
  (1, 1, 2, 1, 'Comida con cliente - Proyecto Alpha', '2024-09-20', 850.00, 'MXN', 1.0, 850.00, 'company_card', 'Restaurante Pujol', 'approved', 'Reunión de cierre de proyecto', TRUE, 2),
  (2, 1, 2, 2, 'Taxi al aeropuerto', '2024-09-21', 320.50, 'MXN', 1.0, 320.50, 'cash', 'Uber', 'pending', NULL, FALSE, 2),
  (3, 2, 3, 7, 'Licencia Adobe Creative Suite', '2024-09-22', 2500.00, 'MXN', 1.0, 2500.00, 'credit_card', 'Adobe Inc', 'approved', 'Renovación anual', FALSE, 3),
  
  -- Gastos en EUR (empresas españolas)
  (4, 4, 5, 5, 'Vuelo Barcelona-Madrid', '2024-09-18', 120.00, 'EUR', 20.15, 2418.00, 'company_card', 'Iberia', 'reimbursed', 'Reunión con cliente en Madrid', TRUE, 5),
  (5, 5, 6, 4, 'Hotel NH Collection Madrid', '2024-09-19', 180.00, 'EUR', 20.15, 3627.00, 'credit_card', 'NH Hotels', 'approved', 'Estadía 2 noches', TRUE, 6),
  
  -- Gastos en USD
  (6, 1, 1, 8, 'Conferencia AWS Re:Invent', '2024-09-15', 1500.00, 'USD', 18.25, 27375.00, 'company_card', 'Amazon Web Services', 'approved', 'Capacitación en cloud computing', FALSE, 1),
  (7, 3, 4, 6, 'Material de oficina importado', '2024-09-23', 250.00, 'USD', 18.25, 4562.50, 'bank_transfer', 'Office Depot USA', 'pending', 'Material especializado', FALSE, 4);

-- Insertar algunos archivos adjuntos de ejemplo
INSERT OR IGNORE INTO attachments (
  expense_id, file_name, file_type, file_url, file_size, mime_type, 
  ocr_text, ocr_confidence, uploaded_by
) VALUES 
  (1, 'ticket_pujol_092024.jpg', 'image', '/uploads/ticket_pujol_092024.jpg', 245760, 'image/jpeg', 'RESTAURANTE PUJOL\nFECHA: 20/09/2024\nTOTAL: $850.00 MXN', 0.95, 2),
  (2, 'recibo_uber_092124.jpg', 'image', '/uploads/recibo_uber_092124.jpg', 128430, 'image/jpeg', 'UBER\nViaje completado\n$320.50', 0.88, 2),
  (3, 'factura_adobe.pdf', 'pdf', '/uploads/factura_adobe.pdf', 89240, 'application/pdf', NULL, NULL, 3),
  (4, 'boarding_pass_iberia.pdf', 'pdf', '/uploads/boarding_pass_iberia.pdf', 156890, 'application/pdf', NULL, NULL, 5),
  (6, 'invoice_aws_reinvent.pdf', 'pdf', '/uploads/invoice_aws_reinvent.pdf', 298450, 'application/pdf', NULL, NULL, 1);