-- Script inicial para la base de datos de Florería Digital

CREATE DATABASE IF NOT EXISTS floreria_db;
USE floreria_db;

-- Tabla Personal
CREATE TABLE IF NOT EXISTS personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    estatus TINYINT DEFAULT 1 CHECK (estatus IN (1, 2)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estatus (estatus),
    INDEX idx_nombre (nombre_completo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre_completo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Arreglos Florales
CREATE TABLE IF NOT EXISTS arreglos_florales (
    id_arreglo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    tipo_arreglo TINYINT NOT NULL CHECK (tipo_arreglo IN (1, 2, 3, 4)),
    estatus TINYINT DEFAULT 1 CHECK (estatus IN (1, 2)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo_arreglo),
    INDEX idx_estatus (estatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    folio VARCHAR(20) PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_arreglo INT NOT NULL,
    descripcion TEXT,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    direccion_entrega VARCHAR(200),
    precio_sugerido DECIMAL(10, 2),
    id_personal INT,
    entregado TINYINT DEFAULT 2 CHECK (entregado IN (1, 2)),
    pagado TINYINT DEFAULT 2 CHECK (pagado IN (1, 2)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_arreglo) REFERENCES arreglos_florales(id_arreglo) ON DELETE RESTRICT,
    FOREIGN KEY (id_personal) REFERENCES personal(id) ON DELETE SET NULL,
    INDEX idx_cliente (id_cliente),
    INDEX idx_personal (id_personal),
    INDEX idx_fecha_pedido (fecha_pedido),
    INDEX idx_fecha_entrega (fecha_entrega),
    INDEX idx_entregado (entregado),
    INDEX idx_pagado (pagado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de prueba

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

-- Usuario administrador para pruebas (esto sería manejado por Firebase en producción)
-- Solo como referencia, no se usa en la BD
-- Email: admin@floreria.com
-- Password: Admin123!