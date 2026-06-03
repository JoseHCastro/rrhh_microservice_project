-- V2: Esquema del proyecto (RRHH)

CREATE TABLE departamentos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    gerente_id BIGINT -- se añade FK luego para evitar referencia circular
);

CREATE TABLE cargos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    salario_por_hora NUMERIC(10,2) NOT NULL
);

-- Actualizamos la tabla empleados creada en V1
ALTER TABLE empleados ADD COLUMN nombre VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE empleados ADD COLUMN apellido VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE empleados ADD COLUMN fecha_contratacion DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE empleados ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO';
ALTER TABLE empleados ADD COLUMN departamento_id BIGINT;
ALTER TABLE empleados ADD COLUMN cargo_id BIGINT;
ALTER TABLE empleados ADD COLUMN supervisor_id BIGINT;
ALTER TABLE empleados ADD COLUMN hora_entrada TIME NOT NULL DEFAULT '08:00:00';
ALTER TABLE empleados ADD COLUMN hora_salida TIME NOT NULL DEFAULT '17:00:00';
ALTER TABLE empleados ADD COLUMN telefono VARCHAR(20);
ALTER TABLE empleados ADD COLUMN carnet_identidad VARCHAR(20) UNIQUE;

-- Agregar FKs de empleados
ALTER TABLE empleados ADD CONSTRAINT fk_empleado_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos (id);
ALTER TABLE empleados ADD CONSTRAINT fk_empleado_cargo FOREIGN KEY (cargo_id) REFERENCES cargos (id);
ALTER TABLE empleados ADD CONSTRAINT fk_empleado_supervisor FOREIGN KEY (supervisor_id) REFERENCES empleados (id);

-- Agregar FK de gerente en departamentos
ALTER TABLE departamentos ADD CONSTRAINT fk_departamento_gerente FOREIGN KEY (gerente_id) REFERENCES empleados (id);

-- ==========================================
-- IoT & Asistencia
-- ==========================================

CREATE TABLE sistema_config (
    id BIGSERIAL PRIMARY KEY,
    estado VARCHAR(20) NOT NULL,
    fecha_hora_estado TIMESTAMP NOT NULL
);

CREATE TABLE reconocimiento_facial (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL UNIQUE,
    codigo_facial VARCHAR(255) NOT NULL UNIQUE,
    fecha_registro TIMESTAMP NOT NULL,
    CONSTRAINT fk_rf_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id)
);

CREATE TABLE registro_asistencia (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    hora_entrada TIMESTAMP NOT NULL,
    hora_salida TIMESTAMP,
    ubicacion_gps VARCHAR(50),
    estado VARCHAR(30) NOT NULL,
    estado_planilla VARCHAR(20) NOT NULL,
    CONSTRAINT fk_ra_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id)
);
CREATE INDEX idx_ra_empleado_entrada ON registro_asistencia (empleado_id, hora_entrada);

-- ==========================================
-- Ausencias
-- ==========================================

CREATE TABLE tipos_ausencia (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE solicitudes_ausencia (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    tipo_ausencia_id BIGINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_solicitud TIMESTAMP,
    aprobador_id BIGINT,
    CONSTRAINT fk_sa_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id),
    CONSTRAINT fk_sa_tipo_ausencia FOREIGN KEY (tipo_ausencia_id) REFERENCES tipos_ausencia (id),
    CONSTRAINT fk_sa_aprobador FOREIGN KEY (aprobador_id) REFERENCES usuarios (id)
);

-- ==========================================
-- Preplanillas
-- ==========================================

CREATE TABLE preplanillas (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    periodo VARCHAR(7) NOT NULL,
    s3_key_uri VARCHAR(500),
    dias_trabajados INT DEFAULT 0,
    faltas INT DEFAULT 0,
    retrasos INT DEFAULT 0,
    permisos_aprobados INT DEFAULT 0,
    licencias INT DEFAULT 0,
    horas_extra NUMERIC(6,2) DEFAULT 0,
    marcaciones_observadas INT DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL,
    documento_hash VARCHAR(64),
    blockchain_tx VARCHAR(100),
    CONSTRAINT fk_preplanilla_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id)
);
CREATE INDEX idx_preplanilla_empleado_periodo ON preplanillas (empleado_id, periodo);

-- ==========================================
-- Token Push FCM
-- ==========================================

CREATE TABLE tokens_push (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token_fcm VARCHAR(500) NOT NULL,
    dispositivo VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    CONSTRAINT fk_tokenpush_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);
