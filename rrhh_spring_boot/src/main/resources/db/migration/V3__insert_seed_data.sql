-- V3: Seed de datos base

-- 1. Insertar roles fijos
INSERT INTO roles (nombre) VALUES 
('ROLE_ADMIN'),
('ROLE_RRHH'),
('ROLE_SUPERVISOR'),
('ROLE_EMPLEADO');

-- 2. Insertar tipos de ausencia
INSERT INTO tipos_ausencia (nombre) VALUES 
('Vacación'),
('Permiso Médico'),
('Licencia por Paternidad/Maternidad'),
('Permiso Personal sin Goce de Haber');

-- 3. Insertar usuario ADMIN base
-- Password: password123 (BCrypt hash)
INSERT INTO usuarios (username, password_hash, activo, created_at) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true, CURRENT_TIMESTAMP);

-- Asignar rol ADMIN
INSERT INTO usuario_roles (usuario_id, rol_id) 
SELECT u.id, r.id FROM usuarios u, roles r WHERE u.username = 'admin' AND r.nombre = 'ROLE_ADMIN';

-- 4. Inicializar Sistema Config para IoT (EMPAREJADO o REGISTRADO por defecto)
INSERT INTO sistema_config (estado, fecha_hora_estado) VALUES ('REGISTRADO', CURRENT_TIMESTAMP);
