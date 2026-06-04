-- Personal
INSERT INTO personal (nombre_completo, direccion, telefono, estatus) VALUES
('Juan Pérez García', 'Calle Juárez 123, Col. Centro', '667-123-4567', 1),
('María López Hernández', 'Av. Álvaro Obregón 456, Col. Las Quintas', '667-234-5678', 1),
('Carlos Rodríguez Sánchez', 'Calle Rosales 789, Col. Guadalupe', '667-345-6789', 1),
('Ana Martínez González', 'Blvd. Madero 321, Col. Chapultepec', '667-456-7890', 2);

-- Clientes
INSERT INTO clientes (nombre_completo, direccion, telefono) VALUES
('Rosa García López', 'Calle Hidalgo 111, Col. Centro', '667-111-2222'),
('Pedro Hernández Ruiz', 'Av. Universidad 222, Col. Universitaria', '667-222-3333'),
('Laura Sánchez Díaz', 'Calle Zapata 333, Col. Tierra Blanca', '667-333-4444'),
('Miguel Ángel Torres', 'Blvd. Las Torres 444, Col. Los Pinos', '667-444-5555'),
('Sofía Ramírez Castro', 'Calle Victoria 555, Col. Miguel Hidalgo', '667-555-6666');

-- Arreglos Florales
INSERT INTO arreglos_florales (descripcion, tipo_arreglo, estatus) VALUES
('Ramo de Rosas Rojas - 12 piezas', 1, 1),
('Centro de Mesa Elegante - Flores Mixtas', 2, 1),
('Corona Fúnebre Clásica - Crisantemos Blancos', 3, 1),
('Arreglo Mixto Primaveral', 4, 1),
('Ramo de Tulipanes - 24 piezas', 1, 1),
('Centro de Mesa Tropical', 2, 1),
('Corona de Despedida - Rosas y Lirios', 3, 2),
('Arreglo Especial San Valentín', 4, 1);

-- Pedidos
INSERT INTO pedidos (folio, id_cliente, id_arreglo, descripcion, fecha_entrega, direccion_entrega, precio_sugerido, id_personal, entregado, pagado) VALUES
('PED-2025-0001', 1, 1, 'Ramo para aniversario con tarjeta personalizada', '2025-06-03 14:00:00', 'Calle Hidalgo 111, Col. Centro', 850.00, 1, 2, 1),
('PED-2025-0002', 2, 4, 'Arreglo para cumpleaños, incluir globos', '2025-06-02 18:00:00', 'Av. Universidad 222, Col. Universitaria', 1200.00, 2, 1, 1),
('PED-2025-0003', 3, 3, 'Corona fúnebre con listón morado', '2025-06-01 10:00:00', 'Capilla San José, Col. Centro', 2500.00, 1, 1, 1),
('PED-2025-0004', 4, 2, 'Centro de mesa para evento corporativo', '2025-06-05 09:00:00', 'Hotel Ejecutivo, Blvd. Las Torres', 1800.00, 3, 2, 2),
('PED-2025-0005', 5, 5, 'Tulipanes para regalo de graduación', '2025-06-04 16:00:00', 'Universidad Autónoma, Aula Magna', 1500.00, 2, 2, 2);