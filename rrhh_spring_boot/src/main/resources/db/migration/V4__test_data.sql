-- ═══════════════════════════════════════════════════════════════════════════════
-- V4: Datos de Prueba Empresariales — TechVentures C.A.
-- Escenario: Ciclo operativo Marzo → Mayo 2026
-- ───────────────────────────────────────────────────────────────────────────────
-- Distribución: 14 cargos · 4 departamentos · 37 empleados · 38 usuarios
--               109 preplanillas · 30 solicitudes · 60 reg. asistencia
--               37 registros faciales · 37 tokens push FCM
--
-- Roles: 1 ROLE_ADMIN (ya existe) · 3 ROLE_RRHH · 4 ROLE_SUPERVISOR · 30 ROLE_EMPLEADO
-- Password de todos los usuarios: password123
-- Hash BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ═══════════════════════════════════════════════════════════════════════════════


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 1: CARGOS (14 cargos por sector)
-- IDs auto-asignados 1..14 (tabla vacía)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO cargos (nombre, salario_por_hora) VALUES
('Gerente de Recursos Humanos',        25.00),   -- 1
('Analista de RRHH Senior',            16.50),   -- 2
('Analista de RRHH Junior',            12.00),   -- 3
('Gerente de Tecnología',              28.50),   -- 4
('Desarrollador Full Stack Senior',    19.00),   -- 5
('Desarrollador Full Stack Junior',    14.00),   -- 6
('Técnico de Soporte TI',              11.50),   -- 7
('Gerente de Operaciones',             27.00),   -- 8
('Supervisor de Operaciones',          17.00),   -- 9
('Operador Logístico Senior',          11.00),   -- 10
('Operador Logístico Junior',           9.50),   -- 11
('Gerente Comercial',                  26.50),   -- 12
('Ejecutivo de Ventas',                13.75),   -- 13
('Asistente Comercial',                 9.00);   -- 14


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 2: DEPARTAMENTOS (gerente_id = NULL; se actualiza luego de insertar empleados)
-- IDs auto-asignados 1..4
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO departamentos (nombre) VALUES
('Recursos Humanos'),          -- 1
('Tecnología e Innovación'),   -- 2
('Operaciones & Logística'),   -- 3
('Comercial & Ventas');        -- 4


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 3: EMPLEADOS (37 total)
-- Depto 1 — RRHH (3 emp · IDs 1-3)   → ROLE_RRHH
-- Depto 2 — TI   (10 emp · IDs 4-13) → 1 ROLE_SUPERVISOR + 9 ROLE_EMPLEADO
-- Depto 3 — Ops  (10 emp · IDs 14-23)→ 1 ROLE_SUPERVISOR + 9 ROLE_EMPLEADO
-- Depto 4 — Com  (14 emp · IDs 24-37)→ 2 ROLE_SUPERVISOR + 12 ROLE_EMPLEADO
-- ──────────────────────────────────────────────────────────────────────────────

-- Depto 1: RRHH ──────────────────────────────────────────────────────────────
INSERT INTO empleados (nombre, apellido, fecha_contratacion, estado,
    departamento_id, cargo_id, supervisor_id, hora_entrada, hora_salida,
    telefono, carnet_identidad) VALUES
('Valeria',   'Mendoza',   '2019-03-01', 'ACTIVO', 1, 1,  NULL, '08:00', '17:00', '70451001', '7500001'), -- 1
('Luis',      'Guerrero',  '2021-06-14', 'ACTIVO', 1, 2,  1,    '08:00', '17:00', '70451002', '7500002'), -- 2
('Andrea',    'Pacheco',   '2022-01-10', 'ACTIVO', 1, 3,  1,    '08:00', '17:00', '70451003', '7500003'); -- 3

-- Depto 2: TI ────────────────────────────────────────────────────────────────
INSERT INTO empleados (nombre, apellido, fecha_contratacion, estado,
    departamento_id, cargo_id, supervisor_id, hora_entrada, hora_salida,
    telefono, carnet_identidad) VALUES
('Carlos',    'Rondón',    '2018-09-15', 'ACTIVO', 2, 4,  NULL, '08:00', '17:00', '70451004', '7500004'), -- 4 SUPERVISOR
('Diego',     'Lozano',    '2023-02-20', 'ACTIVO', 2, 5,  4,    '08:30', '17:30', '70451005', '7500005'), -- 5
('María',     'Quintero',  '2023-07-01', 'ACTIVO', 2, 5,  4,    '08:00', '17:00', '70451006', '7500006'), -- 6
('Jorge',     'Torres',    '2020-11-05', 'ACTIVO', 2, 6,  4,    '08:00', '17:00', '70451007', '7500007'), -- 7
('Kevin',     'Flores',    '2024-01-15', 'ACTIVO', 2, 6,  4,    '08:00', '17:00', '70451008', '7500008'), -- 8
('Paola',     'Vega',      '2022-08-01', 'ACTIVO', 2, 7,  4,    '08:00', '17:00', '70451009', '7500009'), -- 9
('Samuel',    'Rojas',     '2021-03-15', 'ACTIVO', 2, 7,  4,    '09:00', '18:00', '70451010', '7500010'), -- 10
('Daniela',   'Cruz',      '2023-09-01', 'ACTIVO', 2, 6,  4,    '08:00', '17:00', '70451011', '7500011'), -- 11
('Andrés',    'Molina',    '2022-04-10', 'ACTIVO', 2, 7,  4,    '08:00', '17:00', '70451012', '7500012'), -- 12
('Camila',    'Herrera',   '2024-03-01', 'ACTIVO', 2, 6,  4,    '08:30', '17:30', '70451013', '7500013'); -- 13

-- Depto 3: Operaciones ───────────────────────────────────────────────────────
INSERT INTO empleados (nombre, apellido, fecha_contratacion, estado,
    departamento_id, cargo_id, supervisor_id, hora_entrada, hora_salida,
    telefono, carnet_identidad) VALUES
('Sofía',     'Paredes',   '2017-04-22', 'ACTIVO',   3, 8,  NULL, '08:00', '17:00', '70451014', '7500014'), -- 14 SUPERVISOR
('Raúl',      'Moreno',    '2022-08-12', 'ACTIVO',   3, 9,  14,   '08:00', '17:00', '70451015', '7500015'), -- 15
('Yasmin',    'Castro',    '2022-09-03', 'ACTIVO',   3, 10, 15,   '07:00', '16:00', '70451016', '7500016'), -- 16
('Pedro',     'Vargas',    '2020-03-10', 'INACTIVO', 3, 11, 15,   '07:00', '16:00', '70451017', '7500017'), -- 17 INACTIVO
('Natalia',   'Peña',      '2023-05-15', 'ACTIVO',   3, 11, 15,   '07:00', '16:00', '70451018', '7500018'), -- 18
('Marcos',    'Jiménez',   '2021-10-20', 'ACTIVO',   3, 11, 15,   '07:00', '16:00', '70451019', '7500019'), -- 19
('Lucía',     'Fernández', '2020-07-06', 'ACTIVO',   3, 10, 15,   '07:00', '16:00', '70451020', '7500020'), -- 20
('Alejandro', 'Gutiérrez', '2023-01-09', 'ACTIVO',   3, 11, 15,   '07:00', '16:00', '70451021', '7500021'), -- 21
('Isabel',    'Ramírez',   '2024-02-19', 'ACTIVO',   3, 11, 15,   '07:00', '16:00', '70451022', '7500022'), -- 22
('Juan',      'Medina',    '2022-06-01', 'ACTIVO',   3, 11, 15,   '07:00', '16:00', '70451023', '7500023'); -- 23

-- Depto 4: Comercial ─────────────────────────────────────────────────────────
INSERT INTO empleados (nombre, apellido, fecha_contratacion, estado,
    departamento_id, cargo_id, supervisor_id, hora_entrada, hora_salida,
    telefono, carnet_identidad) VALUES
('Patricia',  'Fuentes',   '2020-05-03', 'ACTIVO', 4, 12, NULL, '08:00', '17:00', '70451024', '7500024'), -- 24 SUPERVISOR
('Rodrigo',   'Sánchez',   '2021-08-16', 'ACTIVO', 4, 13, 24,   '08:00', '17:00', '70451025', '7500025'), -- 25 SUPERVISOR
('Gabriela',  'Ortega',    '2022-03-07', 'ACTIVO', 4, 13, 24,   '08:00', '17:00', '70451026', '7500026'), -- 26
('Roberto',   'Castillo',  '2021-11-22', 'ACTIVO', 4, 13, 24,   '08:00', '17:00', '70451027', '7500027'), -- 27
('Adriana',   'Silva',     '2023-04-10', 'ACTIVO', 4, 13, 25,   '09:00', '18:00', '70451028', '7500028'), -- 28
('Héctor',    'Méndez',    '2022-07-18', 'ACTIVO', 4, 13, 25,   '08:00', '17:00', '70451029', '7500029'), -- 29
('Claudia',   'Núñez',     '2023-08-28', 'ACTIVO', 4, 13, 25,   '08:00', '17:00', '70451030', '7500030'), -- 30
('Fernando',  'Torres',    '2024-01-08', 'ACTIVO', 4, 13, 25,   '08:00', '17:00', '70451031', '7500031'), -- 31
('Verónica',  'García',    '2022-10-03', 'ACTIVO', 4, 14, 24,   '08:00', '17:00', '70451032', '7500032'), -- 32
('Mauricio',  'Reyes',     '2021-05-24', 'ACTIVO', 4, 14, 24,   '08:00', '17:00', '70451033', '7500033'), -- 33
('Stephanie', 'Díaz',      '2023-02-13', 'ACTIVO', 4, 14, 24,   '08:00', '17:00', '70451034', '7500034'), -- 34
('Pablo',     'Aguilar',   '2024-06-03', 'ACTIVO', 4, 14, 25,   '08:00', '17:00', '70451035', '7500035'), -- 35
('Carolina',  'Vargas',    '2021-09-14', 'ACTIVO', 4, 13, 25,   '09:00', '18:00', '70451036', '7500036'), -- 36
('Miguel',    'Serrano',   '2022-12-05', 'ACTIVO', 4, 13, 24,   '08:00', '17:00', '70451037', '7500037'); -- 37


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 4: ACTUALIZAR GERENTES DE DEPARTAMENTO
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE departamentos SET gerente_id = 1  WHERE id = 1;  -- Valeria Mendoza → RRHH
UPDATE departamentos SET gerente_id = 4  WHERE id = 2;  -- Carlos Rondón   → TI
UPDATE departamentos SET gerente_id = 14 WHERE id = 3;  -- Sofía Paredes   → Operaciones
UPDATE departamentos SET gerente_id = 24 WHERE id = 4;  -- Patricia Fuentes → Comercial


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 5: USUARIOS (37 nuevos · IDs 2..38 auto-asignados)
-- Nota: admin (id=1) ya existe en V3.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO usuarios (username, password_hash, empleado_id, activo, created_at) VALUES
-- ROLE_RRHH (3)
('v.mendoza',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1,  true,  '2026-03-01 07:00:00'),
('l.guerrero',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2,  true,  '2026-03-01 07:01:00'),
('a.pacheco',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3,  true,  '2026-03-01 07:02:00'),
-- ROLE_SUPERVISOR (4)
('c.rondon',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 4,  true,  '2026-03-01 07:03:00'),
('s.paredes',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 14, true,  '2026-03-01 07:04:00'),
('p.fuentes',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 24, true,  '2026-03-01 07:05:00'),
('r.sanchez',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 25, true,  '2026-03-01 07:06:00'),
-- ROLE_EMPLEADO — Depto TI (9)
('d.lozano',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 5,  true,  '2026-03-01 07:10:00'),
('m.quintero',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 6,  true,  '2026-03-01 07:11:00'),
('j.torres',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 7,  true,  '2026-03-01 07:12:00'),
('k.flores',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 8,  true,  '2026-03-01 07:13:00'),
('p.vega',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 9,  true,  '2026-03-01 07:14:00'),
('s.rojas',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 10, true,  '2026-03-01 07:15:00'),
('d.cruz',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 11, true,  '2026-03-01 07:16:00'),
('an.molina',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 12, true,  '2026-03-01 07:17:00'),
('c.herrera',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 13, true,  '2026-03-01 07:18:00'),
-- ROLE_EMPLEADO — Depto Operaciones (9)
('r.moreno',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 15, true,  '2026-03-01 07:20:00'),
('y.castro',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 16, true,  '2026-03-01 07:21:00'),
('p.vargas',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 17, false, '2026-03-01 07:22:00'), -- INACTIVO
('n.pena',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 18, true,  '2026-03-01 07:23:00'),
('m.jimenez',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 19, true,  '2026-03-01 07:24:00'),
('l.fernandez',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 20, true,  '2026-03-01 07:25:00'),
('al.gutierrez', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 21, true,  '2026-03-01 07:26:00'),
('i.ramirez',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 22, true,  '2026-03-01 07:27:00'),
('j.medina',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 23, true,  '2026-03-01 07:28:00'),
-- ROLE_EMPLEADO — Depto Comercial (12)
('g.ortega',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 26, true,  '2026-03-01 07:30:00'),
('ro.castillo',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 27, true,  '2026-03-01 07:31:00'),
('ad.silva',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 28, true,  '2026-03-01 07:32:00'),
('h.mendez',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 29, true,  '2026-03-01 07:33:00'),
('cl.nunez',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 30, true,  '2026-03-01 07:34:00'),
('fe.torres',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 31, true,  '2026-03-01 07:35:00'),
('v.garcia',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 32, true,  '2026-03-01 07:36:00'),
('ma.reyes',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 33, true,  '2026-03-01 07:37:00'),
('st.diaz',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 34, true,  '2026-03-01 07:38:00'),
('pa.aguilar',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 35, true,  '2026-03-01 07:39:00'),
('ca.vargas',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 36, true,  '2026-03-01 07:40:00'),
('mi.serrano',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 37, true,  '2026-03-01 07:41:00');


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 6: ASIGNACIÓN DE ROLES
-- roles: ROLE_ADMIN=1, ROLE_RRHH=2, ROLE_SUPERVISOR=3, ROLE_EMPLEADO=4
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, 2 FROM usuarios u
WHERE u.username IN ('v.mendoza', 'l.guerrero', 'a.pacheco');

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, 3 FROM usuarios u
WHERE u.username IN ('c.rondon', 's.paredes', 'p.fuentes', 'r.sanchez');

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, 4 FROM usuarios u
WHERE u.username NOT IN ('admin','v.mendoza','l.guerrero','a.pacheco',
                          'c.rondon','s.paredes','p.fuentes','r.sanchez');


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 7: RECONOCIMIENTO FACIAL (37 registros biométricos)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO reconocimiento_facial (empleado_id, codigo_facial, fecha_registro) VALUES
(1,  'FACE_001_a1b2c3d4e5f67890abcdef123456789a', '2019-03-05 09:15:00'),
(2,  'FACE_002_b2c3d4e5f6a17890abcdef123456789b', '2021-06-15 08:30:00'),
(3,  'FACE_003_c3d4e5f6a7b89012abcdef123456789c', '2022-01-11 09:00:00'),
(4,  'FACE_004_d4e5f6a7b8c90123abcdef123456789d', '2018-09-17 08:45:00'),
(5,  'FACE_005_e5f6a7b8c9d01234abcdef123456789e', '2023-02-21 08:15:00'),
(6,  'FACE_006_f6a7b8c9d0e12345abcdef123456789f', '2023-07-02 09:00:00'),
(7,  'FACE_007_a7b8c9d0e1f23456abcdef1234567890', '2020-11-06 08:20:00'),
(8,  'FACE_008_b8c9d0e1f2a34567abcdef1234567891', '2024-01-16 08:30:00'),
(9,  'FACE_009_c9d0e1f2a3b45678abcdef1234567892', '2022-08-02 09:00:00'),
(10, 'FACE_010_d0e1f2a3b4c56789abcdef1234567893', '2021-03-16 09:10:00'),
(11, 'FACE_011_e1f2a3b4c5d67890abcdef1234567894', '2023-09-02 08:00:00'),
(12, 'FACE_012_f2a3b4c5d6e78901abcdef1234567895', '2022-04-11 08:05:00'),
(13, 'FACE_013_a3b4c5d6e7f89012abcdef1234567896', '2024-03-04 08:30:00'),
(14, 'FACE_014_b4c5d6e7f8a90123abcdef1234567897', '2017-04-24 09:00:00'),
(15, 'FACE_015_c5d6e7f8a9b01234abcdef1234567898', '2022-08-13 08:00:00'),
(16, 'FACE_016_d6e7f8a9b0c12345abcdef1234567899', '2022-09-05 07:30:00'),
(17, 'FACE_017_e7f8a9b0c1d23456abcdef123456789a', '2020-03-11 07:45:00'),
(18, 'FACE_018_f8a9b0c1d2e34567abcdef123456789b', '2023-05-16 07:30:00'),
(19, 'FACE_019_a9b0c1d2e3f45678abcdef123456789c', '2021-10-21 07:00:00'),
(20, 'FACE_020_b0c1d2e3f4a56789abcdef123456789d', '2020-07-07 07:15:00'),
(21, 'FACE_021_c1d2e3f4a5b67890abcdef123456789e', '2023-01-10 07:30:00'),
(22, 'FACE_022_d2e3f4a5b6c78901abcdef123456789f', '2024-02-20 07:00:00'),
(23, 'FACE_023_e3f4a5b6c7d89012abcdef1234567800', '2022-06-02 07:15:00'),
(24, 'FACE_024_f4a5b6c7d8e90123abcdef1234567801', '2020-05-05 08:30:00'),
(25, 'FACE_025_a5b6c7d8e9f01234abcdef1234567802', '2021-08-17 08:00:00'),
(26, 'FACE_026_b6c7d8e9f0a12345abcdef1234567803', '2022-03-08 08:00:00'),
(27, 'FACE_027_c7d8e9f0a1b23456abcdef1234567804', '2021-11-23 08:05:00'),
(28, 'FACE_028_d8e9f0a1b2c34567abcdef1234567805', '2023-04-11 09:15:00'),
(29, 'FACE_029_e9f0a1b2c3d45678abcdef1234567806', '2022-07-19 08:00:00'),
(30, 'FACE_030_f0a1b2c3d4e56789abcdef1234567807', '2023-08-29 08:00:00'),
(31, 'FACE_031_a1b2c3d4e5f67890abcdef1234567808', '2024-01-09 08:10:00'),
(32, 'FACE_032_b2c3d4e5f6a78901abcdef1234567809', '2022-10-04 08:00:00'),
(33, 'FACE_033_c3d4e5f6a7b89012abcdef1234567810', '2021-05-25 08:05:00'),
(34, 'FACE_034_d4e5f6a7b8c90123abcdef1234567811', '2023-02-14 08:00:00'),
(35, 'FACE_035_e5f6a7b8c9d01234abcdef1234567812', '2024-06-04 08:15:00'),
(36, 'FACE_036_f6a7b8c9d0e12345abcdef1234567813', '2021-09-15 09:10:00'),
(37, 'FACE_037_a7b8c9d0e1f23456abcdef1234567814', '2022-12-06 08:00:00');


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 8: REGISTRO DE ASISTENCIA (60 registros representativos)
-- Muestra: 6 empleados × 5 días en Abril + 5 días en Mayo 2026
-- emp 1  (Valeria, sch 08:00) · emp 4  (Carlos, sch 08:00)
-- emp 5  (Diego,   sch 08:30) · emp 7  (Jorge,  sch 08:00)
-- emp 14 (Sofía,   sch 08:00) · emp 28 (Adriana, sch 09:00)
-- Umbral de retraso = hora_entrada + 15 min
-- ──────────────────────────────────────────────────────────────────────────────

-- ── ABRIL 2026 ───────────────────────────────────────────────────────────────
INSERT INTO registro_asistencia
    (empleado_id, hora_entrada, hora_salida, ubicacion_gps, estado, estado_planilla)
VALUES
-- 2026-04-01 (Miércoles)
(1,  '2026-04-01 07:55:22', '2026-04-01 17:02:11', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-04-01 07:50:01', '2026-04-01 18:15:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-04-01 08:33:10', '2026-04-01 17:35:22', '10.4791,-66.9052', 'REGISTRADO',          'NORMAL'),
(7,  '2026-04-01 08:02:30', '2026-04-01 17:00:05', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-04-01 07:58:45', '2026-04-01 17:01:30', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-04-01 08:59:00', '2026-04-01 18:01:22', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL'),
-- 2026-04-02 (Jueves) — Diego llega tarde (08:52 > umbral 08:45)
(1,  '2026-04-02 07:58:33', '2026-04-02 17:05:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-04-02 07:55:12', '2026-04-02 18:30:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-04-02 08:52:14', '2026-04-02 17:42:30', '10.4791,-66.9052', 'RETRASO',             'NORMAL'),
(7,  '2026-04-02 08:05:00', '2026-04-02 17:01:44', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-04-02 08:10:22', '2026-04-02 17:05:11', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-04-02 09:03:18', '2026-04-02 18:05:40', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL'),
-- 2026-04-03 (Viernes) — Diego llega tarde; Jorge olvida marcar salida (CRON lo corrige)
(1,  '2026-04-03 08:01:00', '2026-04-03 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-04-03 08:00:00', '2026-04-03 17:30:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-04-03 08:47:33', '2026-04-03 17:38:00', '10.4791,-66.9052', 'RETRASO',             'NORMAL'),
(7,  '2026-04-03 08:00:00', '2026-04-03 23:55:00', '10.4806,-66.9036', 'MARCACION_OBSERVADA', 'OBSERVADO'),
(14, '2026-04-03 07:55:00', '2026-04-03 17:01:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-04-03 09:22:15', '2026-04-03 18:10:00', '10.4821,-66.9014', 'RETRASO',             'NORMAL'),
-- 2026-04-07 (Lunes)
(1,  '2026-04-07 07:59:10', '2026-04-07 17:03:22', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-04-07 07:45:00', '2026-04-07 19:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-04-07 09:15:41', '2026-04-07 17:41:00', '10.4791,-66.9052', 'RETRASO',             'NORMAL'),
(7,  '2026-04-07 08:01:22', '2026-04-07 17:02:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-04-07 08:00:00', '2026-04-07 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-04-07 09:00:00', '2026-04-07 18:02:30', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL'),
-- 2026-04-08 (Martes)
(1,  '2026-04-08 08:03:00', '2026-04-08 17:01:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-04-08 08:02:11', '2026-04-08 18:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-04-08 08:29:00', '2026-04-08 17:31:00', '10.4791,-66.9052', 'REGISTRADO',          'NORMAL'),
(7,  '2026-04-08 08:03:40', '2026-04-08 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-04-08 08:07:00', '2026-04-08 17:02:11', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-04-08 08:58:22', '2026-04-08 18:00:00', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL');

-- ── MAYO 2026 ────────────────────────────────────────────────────────────────
INSERT INTO registro_asistencia
    (empleado_id, hora_entrada, hora_salida, ubicacion_gps, estado, estado_planilla)
VALUES
-- 2026-05-05 (Lunes)
(1,  '2026-05-05 08:00:11', '2026-05-05 17:05:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-05-05 07:52:00', '2026-05-05 18:45:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-05-05 08:31:00', '2026-05-05 17:32:00', '10.4791,-66.9052', 'REGISTRADO',          'NORMAL'),
(7,  '2026-05-05 08:00:00', '2026-05-05 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-05-05 07:58:30', '2026-05-05 17:01:15', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-05-05 09:01:00', '2026-05-05 18:02:00', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL'),
-- 2026-05-06 (Martes)
(1,  '2026-05-06 07:57:00', '2026-05-06 17:10:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-05-06 07:55:00', '2026-05-06 18:20:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-05-06 08:51:00', '2026-05-06 17:40:00', '10.4791,-66.9052', 'RETRASO',             'NORMAL'),
(7,  '2026-05-06 08:04:00', '2026-05-06 17:01:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-05-06 08:00:00', '2026-05-06 17:00:22', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-05-06 09:04:11', '2026-05-06 18:00:00', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL'),
-- 2026-05-07 (Miércoles) — Jorge olvida marcar salida por 2da vez
(1,  '2026-05-07 08:02:00', '2026-05-07 17:03:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-05-07 07:48:00', '2026-05-07 18:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-05-07 08:32:00', '2026-05-07 17:35:00', '10.4791,-66.9052', 'REGISTRADO',          'NORMAL'),
(7,  '2026-05-07 08:01:00', '2026-05-07 23:55:00', '10.4806,-66.9036', 'MARCACION_OBSERVADA', 'OBSERVADO'),
(14, '2026-05-07 07:59:00', '2026-05-07 17:02:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-05-07 08:59:00', '2026-05-07 18:01:00', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL'),
-- 2026-05-08 (Jueves)
(1,  '2026-05-08 08:00:00', '2026-05-08 17:01:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-05-08 08:00:00', '2026-05-08 18:30:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-05-08 09:10:05', '2026-05-08 17:38:00', '10.4791,-66.9052', 'RETRASO',             'NORMAL'),
(7,  '2026-05-08 08:02:11', '2026-05-08 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-05-08 08:05:00', '2026-05-08 17:00:30', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-05-08 09:18:00', '2026-05-08 18:05:00', '10.4821,-66.9014', 'RETRASO',             'NORMAL'),
-- 2026-05-09 (Viernes)
(1,  '2026-05-09 07:56:00', '2026-05-09 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(4,  '2026-05-09 07:50:00', '2026-05-09 18:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(5,  '2026-05-09 08:43:00', '2026-05-09 17:36:00', '10.4791,-66.9052', 'REGISTRADO',          'NORMAL'),
(7,  '2026-05-09 08:03:00', '2026-05-09 17:01:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(14, '2026-05-09 08:00:00', '2026-05-09 17:00:00', '10.4806,-66.9036', 'REGISTRADO',          'NORMAL'),
(28, '2026-05-09 09:00:00', '2026-05-09 18:00:00', '10.4821,-66.9014', 'REGISTRADO',          'NORMAL');


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 9: SOLICITUDES DE AUSENCIA (30 registros)
-- tipos_ausencia: 1=Vacación · 2=Permiso Médico · 3=Lic.Paternidad · 4=Permiso Personal
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO solicitudes_ausencia
    (empleado_id, tipo_ausencia_id, fecha_inicio, fecha_fin, estado, fecha_solicitud, aprobador_id)
VALUES
-- APROBADAS (17) ─────────────────────────────────────────────────────────────
(5,  1, '2026-04-10', '2026-04-20', 'APROBADA',  '2026-04-05 09:00:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(15, 2, '2026-04-03', '2026-04-05', 'APROBADA',  '2026-04-02 10:15:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(26, 1, '2026-03-10', '2026-03-14', 'APROBADA',  '2026-03-05 08:30:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(33, 4, '2026-03-05', '2026-03-05', 'APROBADA',  '2026-03-04 09:00:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(30, 1, '2026-03-24', '2026-03-28', 'APROBADA',  '2026-03-17 11:00:00', (SELECT id FROM usuarios WHERE username='a.pacheco')),
(21, 2, '2026-03-20', '2026-03-22', 'APROBADA',  '2026-03-18 08:00:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(37, 2, '2026-04-08', '2026-04-10', 'APROBADA',  '2026-04-07 09:30:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(16, 4, '2026-04-30', '2026-04-30', 'APROBADA',  '2026-04-29 10:00:00', (SELECT id FROM usuarios WHERE username='a.pacheco')),
(8,  1, '2026-03-17', '2026-03-21', 'APROBADA',  '2026-03-10 08:45:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(19, 2, '2026-04-17', '2026-04-18', 'APROBADA',  '2026-04-16 11:30:00', (SELECT id FROM usuarios WHERE username='a.pacheco')),
(27, 1, '2026-04-07', '2026-04-11', 'APROBADA',  '2026-04-01 09:00:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(10, 1, '2026-04-14', '2026-04-25', 'APROBADA',  '2026-04-07 08:00:00', (SELECT id FROM usuarios WHERE username='a.pacheco')),
(29, 1, '2026-03-03', '2026-03-07', 'APROBADA',  '2026-02-24 10:00:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(31, 4, '2026-04-04', '2026-04-04', 'APROBADA',  '2026-04-03 09:15:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(22, 2, '2026-03-25', '2026-03-27', 'APROBADA',  '2026-03-24 08:30:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(2,  3, '2026-04-28', '2026-05-09', 'APROBADA',  '2026-04-22 09:00:00', (SELECT id FROM usuarios WHERE username='v.mendoza')), -- Licencia Paternidad
(28, 1, '2026-05-05', '2026-05-15', 'APROBADA',  '2026-04-28 11:00:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
-- RECHAZADAS (6) ─────────────────────────────────────────────────────────────
(7,  4, '2026-03-15', '2026-03-15', 'RECHAZADA', '2026-03-14 16:00:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(12, 4, '2026-05-02', '2026-05-02', 'RECHAZADA', '2026-04-30 15:00:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
(6,  4, '2026-04-22', '2026-04-22', 'RECHAZADA', '2026-04-21 17:00:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(35, 4, '2026-03-07', '2026-03-07', 'RECHAZADA', '2026-03-06 14:30:00', (SELECT id FROM usuarios WHERE username='v.mendoza')),
(34, 2, '2026-04-25', '2026-04-27', 'RECHAZADA', '2026-04-24 09:00:00', (SELECT id FROM usuarios WHERE username='a.pacheco')),
(13, 4, '2026-05-23', '2026-05-23', 'RECHAZADA', '2026-05-22 16:45:00', (SELECT id FROM usuarios WHERE username='l.guerrero')),
-- PENDIENTES (7) — sin aprobador ─────────────────────────────────────────────
(18, 2, '2026-05-15', '2026-05-16', 'PENDIENTE', '2026-05-14 08:00:00', NULL),
(9,  1, '2026-05-19', '2026-05-30', 'PENDIENTE', '2026-05-12 10:00:00', NULL),
(23, 2, '2026-05-06', '2026-05-07', 'PENDIENTE', '2026-05-05 09:00:00', NULL),
(32, 4, '2026-05-09', '2026-05-09', 'PENDIENTE', '2026-05-08 14:00:00', NULL),
(11, 4, '2026-05-16', '2026-05-16', 'PENDIENTE', '2026-05-15 11:30:00', NULL),
(36, 2, '2026-05-22', '2026-05-23', 'PENDIENTE', '2026-05-21 09:45:00', NULL),
(20, 1, '2026-05-26', '2026-06-06', 'PENDIENTE', '2026-05-19 10:00:00', NULL);


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 10: PREPLANILLAS (109 registros)
-- Período 2026-03: 37 empleados (incluye emp 17 último mes activo)
-- Período 2026-04: 36 empleados (excluye emp 17 INACTIVO)
-- Período 2026-05: 36 empleados (excluye emp 17 INACTIVO)
-- ──────────────────────────────────────────────────────────────────────────────

-- ── Período 2026-03 (37 registros · 22 días laborables) ─────────────────────
INSERT INTO preplanillas
    (empleado_id, periodo, s3_key_uri, dias_trabajados, faltas, retrasos,
     permisos_aprobados, licencias, horas_extra, marcaciones_observadas, fecha_creacion)
VALUES
(1,  '2026-03', 'preplanillas/2026-03/emp-001-mendoza.pdf',   22, 0, 0, 1, 0,  4.50, 0, '2026-04-01 09:00:00'),
(2,  '2026-03', 'preplanillas/2026-03/emp-002-guerrero.pdf',  21, 1, 1, 0, 0,  0.00, 0, '2026-04-01 09:01:00'),
(3,  '2026-03', 'preplanillas/2026-03/emp-003-pacheco.pdf',   22, 0, 0, 0, 0,  0.00, 0, '2026-04-01 09:02:00'),
(4,  '2026-03', 'preplanillas/2026-03/emp-004-rondon.pdf',    22, 0, 0, 0, 0,  8.00, 0, '2026-04-01 09:03:00'),
(5,  '2026-03', 'preplanillas/2026-03/emp-005-lozano.pdf',    19, 2, 3, 0, 0,  2.25, 1, '2026-04-01 09:04:00'),
(6,  '2026-03', 'preplanillas/2026-03/emp-006-quintero.pdf',  22, 0, 1, 0, 0,  3.75, 0, '2026-04-01 09:05:00'),
(7,  '2026-03', 'preplanillas/2026-03/emp-007-torres.pdf',    20, 2, 1, 0, 0,  0.00, 1, '2026-04-01 09:06:00'),
(8,  '2026-03', 'preplanillas/2026-03/emp-008-flores.pdf',    21, 0, 2, 1, 0,  0.00, 0, '2026-04-01 09:07:00'),
(9,  '2026-03', 'preplanillas/2026-03/emp-009-vega.pdf',      21, 0, 1, 1, 0,  0.00, 0, '2026-04-01 09:08:00'),
(10, '2026-03', 'preplanillas/2026-03/emp-010-rojas.pdf',     22, 0, 3, 0, 0,  0.00, 0, '2026-04-01 09:09:00'),
(11, '2026-03', 'preplanillas/2026-03/emp-011-cruz.pdf',      22, 0, 0, 0, 0,  0.00, 0, '2026-04-01 09:10:00'),
(12, '2026-03', 'preplanillas/2026-03/emp-012-molina.pdf',    21, 1, 0, 0, 0,  0.00, 0, '2026-04-01 09:11:00'),
(13, '2026-03', 'preplanillas/2026-03/emp-013-herrera.pdf',   22, 0, 2, 0, 0,  0.00, 0, '2026-04-01 09:12:00'),
(14, '2026-03', 'preplanillas/2026-03/emp-014-paredes.pdf',   22, 0, 0, 0, 0,  8.00, 0, '2026-04-01 09:13:00'),
(15, '2026-03', 'preplanillas/2026-03/emp-015-moreno.pdf',    20, 2, 1, 0, 0,  0.00, 0, '2026-04-01 09:14:00'),
(16, '2026-03', 'preplanillas/2026-03/emp-016-castro.pdf',    22, 0, 1, 0, 0,  0.00, 0, '2026-04-01 09:15:00'),
(17, '2026-03', 'preplanillas/2026-03/emp-017-vargas.pdf',    15, 7, 0, 0, 0,  0.00, 0, '2026-04-01 09:16:00'),
(18, '2026-03', 'preplanillas/2026-03/emp-018-pena.pdf',      21, 1, 2, 0, 0,  0.00, 0, '2026-04-01 09:17:00'),
(19, '2026-03', 'preplanillas/2026-03/emp-019-jimenez.pdf',   22, 0, 1, 0, 0,  0.00, 0, '2026-04-01 09:18:00'),
(20, '2026-03', 'preplanillas/2026-03/emp-020-fernandez.pdf', 22, 0, 2, 0, 0,  0.00, 0, '2026-04-01 09:19:00'),
(21, '2026-03', 'preplanillas/2026-03/emp-021-gutierrez.pdf', 21, 1, 1, 0, 0,  0.00, 0, '2026-04-01 09:20:00'),
(22, '2026-03', 'preplanillas/2026-03/emp-022-ramirez.pdf',   22, 0, 0, 0, 0,  0.00, 0, '2026-04-01 09:21:00'),
(23, '2026-03', 'preplanillas/2026-03/emp-023-medina.pdf',    20, 2, 2, 0, 0,  0.00, 0, '2026-04-01 09:22:00'),
(24, '2026-03', 'preplanillas/2026-03/emp-024-fuentes.pdf',   22, 0, 0, 0, 0,  4.50, 0, '2026-04-01 09:23:00'),
(25, '2026-03', 'preplanillas/2026-03/emp-025-sanchez.pdf',   22, 0, 1, 0, 0,  2.25, 0, '2026-04-01 09:24:00'),
(26, '2026-03', 'preplanillas/2026-03/emp-026-ortega.pdf',    20, 2, 2, 1, 0,  0.00, 0, '2026-04-01 09:25:00'),
(27, '2026-03', 'preplanillas/2026-03/emp-027-castillo.pdf',  22, 0, 1, 0, 0,  0.00, 0, '2026-04-01 09:26:00'),
(28, '2026-03', 'preplanillas/2026-03/emp-028-silva.pdf',     20, 2, 3, 0, 0,  0.00, 1, '2026-04-01 09:27:00'),
(29, '2026-03', 'preplanillas/2026-03/emp-029-mendez.pdf',    21, 0, 1, 1, 0,  0.00, 0, '2026-04-01 09:28:00'),
(30, '2026-03', 'preplanillas/2026-03/emp-030-nunez.pdf',     21, 1, 0, 1, 0,  0.00, 0, '2026-04-01 09:29:00'),
(31, '2026-03', 'preplanillas/2026-03/emp-031-ftorres.pdf',   22, 0, 2, 0, 0,  0.00, 0, '2026-04-01 09:30:00'),
(32, '2026-03', 'preplanillas/2026-03/emp-032-garcia.pdf',    22, 0, 0, 0, 0,  0.00, 0, '2026-04-01 09:31:00'),
(33, '2026-03', 'preplanillas/2026-03/emp-033-reyes.pdf',     21, 1, 1, 1, 0,  0.00, 0, '2026-04-01 09:32:00'),
(34, '2026-03', 'preplanillas/2026-03/emp-034-diaz.pdf',      22, 0, 2, 0, 0,  0.00, 0, '2026-04-01 09:33:00'),
(35, '2026-03', 'preplanillas/2026-03/emp-035-aguilar.pdf',   21, 1, 0, 0, 0,  0.00, 0, '2026-04-01 09:34:00'),
(36, '2026-03', 'preplanillas/2026-03/emp-036-cvargas.pdf',   22, 0, 1, 0, 0,  0.00, 0, '2026-04-01 09:35:00'),
(37, '2026-03', 'preplanillas/2026-03/emp-037-serrano.pdf',   20, 2, 3, 0, 0,  0.00, 1, '2026-04-01 09:36:00');

-- ── Período 2026-04 (36 registros · emp 17 excluido) ────────────────────────
INSERT INTO preplanillas
    (empleado_id, periodo, s3_key_uri, dias_trabajados, faltas, retrasos,
     permisos_aprobados, licencias, horas_extra, marcaciones_observadas, fecha_creacion)
VALUES
(1,  '2026-04', 'preplanillas/2026-04/emp-001-mendoza.pdf',   22, 0, 0, 0, 0,  6.00, 0, '2026-05-01 09:00:00'),
(2,  '2026-04', 'preplanillas/2026-04/emp-002-guerrero.pdf',  11, 0, 0, 0, 1,  0.00, 0, '2026-05-01 09:01:00'),
(3,  '2026-04', 'preplanillas/2026-04/emp-003-pacheco.pdf',   22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:02:00'),
(4,  '2026-04', 'preplanillas/2026-04/emp-004-rondon.pdf',    22, 0, 0, 0, 0,  8.00, 0, '2026-05-01 09:03:00'),
(5,  '2026-04', 'preplanillas/2026-04/emp-005-lozano.pdf',    17, 2, 3, 1, 0,  0.00, 0, '2026-05-01 09:04:00'),
(6,  '2026-04', 'preplanillas/2026-04/emp-006-quintero.pdf',  21, 1, 0, 0, 0,  0.00, 0, '2026-05-01 09:05:00'),
(7,  '2026-04', 'preplanillas/2026-04/emp-007-torres.pdf',    19, 2, 2, 0, 0,  0.00, 1, '2026-05-01 09:06:00'),
(8,  '2026-04', 'preplanillas/2026-04/emp-008-flores.pdf',    22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:07:00'),
(9,  '2026-04', 'preplanillas/2026-04/emp-009-vega.pdf',      21, 0, 2, 0, 0,  0.00, 0, '2026-05-01 09:08:00'),
(10, '2026-04', 'preplanillas/2026-04/emp-010-rojas.pdf',     14, 2, 2, 1, 0,  0.00, 0, '2026-05-01 09:09:00'),
(11, '2026-04', 'preplanillas/2026-04/emp-011-cruz.pdf',      22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:10:00'),
(12, '2026-04', 'preplanillas/2026-04/emp-012-molina.pdf',    20, 2, 1, 0, 0,  0.00, 0, '2026-05-01 09:11:00'),
(13, '2026-04', 'preplanillas/2026-04/emp-013-herrera.pdf',   22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:12:00'),
(14, '2026-04', 'preplanillas/2026-04/emp-014-paredes.pdf',   22, 0, 0, 0, 0,  6.00, 0, '2026-05-01 09:13:00'),
(15, '2026-04', 'preplanillas/2026-04/emp-015-moreno.pdf',    19, 0, 0, 0, 0,  0.00, 0, '2026-05-01 09:14:00'),
(16, '2026-04', 'preplanillas/2026-04/emp-016-castro.pdf',    21, 1, 1, 1, 0,  0.00, 0, '2026-05-01 09:15:00'),
(18, '2026-04', 'preplanillas/2026-04/emp-018-pena.pdf',      22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:16:00'),
(19, '2026-04', 'preplanillas/2026-04/emp-019-jimenez.pdf',   21, 1, 0, 0, 0,  0.00, 0, '2026-05-01 09:17:00'),
(20, '2026-04', 'preplanillas/2026-04/emp-020-fernandez.pdf', 22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:18:00'),
(21, '2026-04', 'preplanillas/2026-04/emp-021-gutierrez.pdf', 21, 1, 2, 0, 0,  0.00, 0, '2026-05-01 09:19:00'),
(22, '2026-04', 'preplanillas/2026-04/emp-022-ramirez.pdf',   22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:20:00'),
(23, '2026-04', 'preplanillas/2026-04/emp-023-medina.pdf',    21, 1, 1, 0, 0,  0.00, 0, '2026-05-01 09:21:00'),
(24, '2026-04', 'preplanillas/2026-04/emp-024-fuentes.pdf',   22, 0, 0, 0, 0,  6.00, 0, '2026-05-01 09:22:00'),
(25, '2026-04', 'preplanillas/2026-04/emp-025-sanchez.pdf',   21, 1, 0, 0, 0,  1.50, 0, '2026-05-01 09:23:00'),
(26, '2026-04', 'preplanillas/2026-04/emp-026-ortega.pdf',    22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:24:00'),
(27, '2026-04', 'preplanillas/2026-04/emp-027-castillo.pdf',  17, 0, 0, 1, 0,  0.00, 0, '2026-05-01 09:25:00'),
(28, '2026-04', 'preplanillas/2026-04/emp-028-silva.pdf',     19, 3, 2, 0, 0,  0.00, 0, '2026-05-01 09:26:00'),
(29, '2026-04', 'preplanillas/2026-04/emp-029-mendez.pdf',    22, 0, 0, 0, 0,  0.00, 0, '2026-05-01 09:27:00'),
(30, '2026-04', 'preplanillas/2026-04/emp-030-nunez.pdf',     22, 0, 2, 0, 0,  0.00, 0, '2026-05-01 09:28:00'),
(31, '2026-04', 'preplanillas/2026-04/emp-031-ftorres.pdf',   21, 1, 1, 1, 0,  0.00, 0, '2026-05-01 09:29:00'),
(32, '2026-04', 'preplanillas/2026-04/emp-032-garcia.pdf',    21, 1, 1, 0, 0,  0.00, 0, '2026-05-01 09:30:00'),
(33, '2026-04', 'preplanillas/2026-04/emp-033-reyes.pdf',     21, 1, 0, 0, 0,  0.00, 0, '2026-05-01 09:31:00'),
(34, '2026-04', 'preplanillas/2026-04/emp-034-diaz.pdf',      22, 0, 1, 0, 0,  0.00, 0, '2026-05-01 09:32:00'),
(35, '2026-04', 'preplanillas/2026-04/emp-035-aguilar.pdf',   20, 2, 1, 0, 0,  0.00, 0, '2026-05-01 09:33:00'),
(36, '2026-04', 'preplanillas/2026-04/emp-036-cvargas.pdf',   21, 1, 2, 0, 0,  0.00, 0, '2026-05-01 09:34:00'),
(37, '2026-04', 'preplanillas/2026-04/emp-037-serrano.pdf',   21, 1, 1, 0, 0,  0.00, 0, '2026-05-01 09:35:00');

-- ── Período 2026-05 (36 registros · emp 17 excluido) ────────────────────────
INSERT INTO preplanillas
    (empleado_id, periodo, s3_key_uri, dias_trabajados, faltas, retrasos,
     permisos_aprobados, licencias, horas_extra, marcaciones_observadas, fecha_creacion)
VALUES
(1,  '2026-05', 'preplanillas/2026-05/emp-001-mendoza.pdf',   20, 0, 0, 2, 0,  2.25, 0, '2026-06-01 09:00:00'),
(2,  '2026-05', 'preplanillas/2026-05/emp-002-guerrero.pdf',  11, 0, 1, 0, 1,  0.00, 0, '2026-06-01 09:01:00'),
(3,  '2026-05', 'preplanillas/2026-05/emp-003-pacheco.pdf',   21, 0, 0, 1, 0,  0.00, 0, '2026-06-01 09:02:00'),
(4,  '2026-05', 'preplanillas/2026-05/emp-004-rondon.pdf',    22, 0, 0, 0, 0,  6.00, 0, '2026-06-01 09:03:00'),
(5,  '2026-05', 'preplanillas/2026-05/emp-005-lozano.pdf',    20, 1, 2, 0, 0,  0.00, 1, '2026-06-01 09:04:00'),
(6,  '2026-05', 'preplanillas/2026-05/emp-006-quintero.pdf',  22, 0, 2, 0, 0,  1.50, 0, '2026-06-01 09:05:00'),
(7,  '2026-05', 'preplanillas/2026-05/emp-007-torres.pdf',    21, 1, 1, 0, 0,  0.00, 1, '2026-06-01 09:06:00'),
(8,  '2026-05', 'preplanillas/2026-05/emp-008-flores.pdf',    22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:07:00'),
(9,  '2026-05', 'preplanillas/2026-05/emp-009-vega.pdf',      20, 1, 1, 0, 0,  0.00, 0, '2026-06-01 09:08:00'),
(10, '2026-05', 'preplanillas/2026-05/emp-010-rojas.pdf',     22, 0, 1, 0, 0,  0.00, 0, '2026-06-01 09:09:00'),
(11, '2026-05', 'preplanillas/2026-05/emp-011-cruz.pdf',      22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:10:00'),
(12, '2026-05', 'preplanillas/2026-05/emp-012-molina.pdf',    21, 0, 1, 0, 0,  0.00, 1, '2026-06-01 09:11:00'),
(13, '2026-05', 'preplanillas/2026-05/emp-013-herrera.pdf',   21, 1, 0, 0, 0,  0.00, 0, '2026-06-01 09:12:00'),
(14, '2026-05', 'preplanillas/2026-05/emp-014-paredes.pdf',   21, 0, 0, 1, 0,  2.25, 0, '2026-06-01 09:13:00'),
(15, '2026-05', 'preplanillas/2026-05/emp-015-moreno.pdf',    22, 0, 2, 0, 0,  0.00, 0, '2026-06-01 09:14:00'),
(16, '2026-05', 'preplanillas/2026-05/emp-016-castro.pdf',    22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:15:00'),
(18, '2026-05', 'preplanillas/2026-05/emp-018-pena.pdf',      21, 1, 0, 0, 0,  0.00, 0, '2026-06-01 09:16:00'),
(19, '2026-05', 'preplanillas/2026-05/emp-019-jimenez.pdf',   22, 0, 2, 0, 0,  0.00, 0, '2026-06-01 09:17:00'),
(20, '2026-05', 'preplanillas/2026-05/emp-020-fernandez.pdf', 21, 0, 1, 1, 0,  0.00, 0, '2026-06-01 09:18:00'),
(21, '2026-05', 'preplanillas/2026-05/emp-021-gutierrez.pdf', 20, 2, 1, 0, 0,  0.00, 1, '2026-06-01 09:19:00'),
(22, '2026-05', 'preplanillas/2026-05/emp-022-ramirez.pdf',   22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:20:00'),
(23, '2026-05', 'preplanillas/2026-05/emp-023-medina.pdf',    22, 0, 2, 0, 0,  0.00, 0, '2026-06-01 09:21:00'),
(24, '2026-05', 'preplanillas/2026-05/emp-024-fuentes.pdf',   21, 0, 1, 1, 0,  2.25, 0, '2026-06-01 09:22:00'),
(25, '2026-05', 'preplanillas/2026-05/emp-025-sanchez.pdf',   22, 0, 0, 0, 0,  1.50, 0, '2026-06-01 09:23:00'),
(26, '2026-05', 'preplanillas/2026-05/emp-026-ortega.pdf',    20, 2, 1, 0, 0,  0.00, 0, '2026-06-01 09:24:00'),
(27, '2026-05', 'preplanillas/2026-05/emp-027-castillo.pdf',  22, 0, 1, 0, 0,  0.00, 0, '2026-06-01 09:25:00'),
(28, '2026-05', 'preplanillas/2026-05/emp-028-silva.pdf',     15, 0, 2, 1, 0,  0.00, 0, '2026-06-01 09:26:00'),
(29, '2026-05', 'preplanillas/2026-05/emp-029-mendez.pdf',    21, 1, 0, 0, 0,  0.00, 0, '2026-06-01 09:27:00'),
(30, '2026-05', 'preplanillas/2026-05/emp-030-nunez.pdf',     20, 2, 1, 0, 0,  0.00, 0, '2026-06-01 09:28:00'),
(31, '2026-05', 'preplanillas/2026-05/emp-031-ftorres.pdf',   22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:29:00'),
(32, '2026-05', 'preplanillas/2026-05/emp-032-garcia.pdf',    22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:30:00'),
(33, '2026-05', 'preplanillas/2026-05/emp-033-reyes.pdf',     20, 2, 2, 0, 0,  0.00, 1, '2026-06-01 09:31:00'),
(34, '2026-05', 'preplanillas/2026-05/emp-034-diaz.pdf',      21, 0, 1, 1, 0,  0.00, 0, '2026-06-01 09:32:00'),
(35, '2026-05', 'preplanillas/2026-05/emp-035-aguilar.pdf',   22, 0, 1, 0, 0,  0.00, 0, '2026-06-01 09:33:00'),
(36, '2026-05', 'preplanillas/2026-05/emp-036-cvargas.pdf',   22, 0, 0, 0, 0,  0.00, 0, '2026-06-01 09:34:00'),
(37, '2026-05', 'preplanillas/2026-05/emp-037-serrano.pdf',   22, 0, 2, 0, 0,  0.00, 0, '2026-06-01 09:35:00');


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 11: TOKENS PUSH FCM (uno por usuario con empleado asignado)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO tokens_push (usuario_id, token_fcm, dispositivo, activo, created_at)
SELECT
    u.id,
    CONCAT('fcm_tv_', LPAD(e.id::text, 3, '0'), '_',
           SUBSTRING(md5(u.username || 'techventures2026' || e.id::text), 1, 32),
           SUBSTRING(md5(e.carnet_identidad || u.username), 1, 32)
    ),
    CASE WHEN (e.id % 3 = 0) THEN 'iOS' ELSE 'Android' END,
    u.activo,
    '2026-03-01 08:00:00'
FROM usuarios u
JOIN empleados e ON u.empleado_id = e.id;


-- ──────────────────────────────────────────────────────────────────────────────
-- PASO 12: AJUSTE DE SECUENCIAS (evita conflictos en nuevos INSERTs vía API)
-- ──────────────────────────────────────────────────────────────────────────────
SELECT setval('cargos_id_seq',                (SELECT MAX(id) FROM cargos));
SELECT setval('departamentos_id_seq',         (SELECT MAX(id) FROM departamentos));
SELECT setval('empleados_id_seq',             (SELECT MAX(id) FROM empleados));
SELECT setval('usuarios_id_seq',              (SELECT MAX(id) FROM usuarios));
SELECT setval('reconocimiento_facial_id_seq', (SELECT MAX(id) FROM reconocimiento_facial));
SELECT setval('registro_asistencia_id_seq',   (SELECT MAX(id) FROM registro_asistencia));
SELECT setval('solicitudes_ausencia_id_seq',  (SELECT MAX(id) FROM solicitudes_ausencia));
SELECT setval('preplanillas_id_seq',          (SELECT MAX(id) FROM preplanillas));
SELECT setval('tokens_push_id_seq',           (SELECT MAX(id) FROM tokens_push));
