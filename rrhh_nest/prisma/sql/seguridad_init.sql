-- ════════════════════════════════════════════════════════════════
-- Módulo 3 — Inicialización del schema `seguridad`
--
-- Se aplica con:  npx prisma db execute --file prisma/sql/seguridad_init.sql --schema prisma/schema.prisma
--
-- IMPORTANTE: Las tablas public.usuarios / empleados / roles / usuario_roles
-- son propiedad de Spring Boot (Flyway) y DEBEN existir antes de correr esto
-- (las FKs de seguridad.* las referencian). Este script NO las toca.
--
-- Es idempotente: usa IF NOT EXISTS / DO-blocks donde aplica.
-- ════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS seguridad;

-- ─── ENUM TYPES ──────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE seguridad.categoria_archivo AS ENUM
        ('CONTRATO', 'CERTIFICADO_MEDICO', 'FOTO', 'JUSTIFICACION_AUSENCIA', 'OTRO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE seguridad.estado_archivo AS ENUM
        ('PENDIENTE_SUBIDA', 'ACTIVO', 'ELIMINADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE seguridad.tipo_canal AS ENUM
        ('TELEGRAM', 'WHATSAPP', 'EMAIL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE seguridad.estado_justificacion AS ENUM
        ('PENDIENTE', 'APROBADA', 'RECHAZADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── PRIVILEGIO ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.privilegio (
    id          BIGSERIAL PRIMARY KEY,
    codigo      VARCHAR(80)  NOT NULL UNIQUE,
    nombre      VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    modulo      VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT now()
);

-- ─── GRUPO ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.grupo (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500),
    activo      BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT now()
);

-- ─── GRUPO_PRIVILEGIO (M:N) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.grupo_privilegio (
    grupo_id      BIGINT NOT NULL,
    privilegio_id BIGINT NOT NULL,
    PRIMARY KEY (grupo_id, privilegio_id),
    CONSTRAINT fk_gp_grupo      FOREIGN KEY (grupo_id)      REFERENCES seguridad.grupo (id)      ON DELETE CASCADE,
    CONSTRAINT fk_gp_privilegio FOREIGN KEY (privilegio_id) REFERENCES seguridad.privilegio (id) ON DELETE CASCADE
);

-- ─── USUARIO_GRUPO (M:N, usuario vive en public) ─────────────────
CREATE TABLE IF NOT EXISTS seguridad.usuario_grupo (
    usuario_id      BIGINT NOT NULL,
    grupo_id        BIGINT NOT NULL,
    asignado_por_id BIGINT,
    asignado_at     TIMESTAMP(6) NOT NULL DEFAULT now(),
    PRIMARY KEY (usuario_id, grupo_id),
    CONSTRAINT fk_ug_usuario      FOREIGN KEY (usuario_id)      REFERENCES public.usuarios (id)  ON DELETE CASCADE,
    CONSTRAINT fk_ug_grupo        FOREIGN KEY (grupo_id)        REFERENCES seguridad.grupo (id)  ON DELETE CASCADE,
    CONSTRAINT fk_ug_asignado_por FOREIGN KEY (asignado_por_id) REFERENCES public.usuarios (id)  ON DELETE SET NULL
);

-- ─── ARCHIVO (metadata; binario vive en S3) ──────────────────────
CREATE TABLE IF NOT EXISTS seguridad.archivo (
    id                          BIGSERIAL PRIMARY KEY,
    nombre                      VARCHAR(255) NOT NULL,
    descripcion                 VARCHAR(500),
    categoria                   seguridad.categoria_archivo NOT NULL,
    s3_key                      VARCHAR(500) NOT NULL UNIQUE,
    content_type                VARCHAR(150) NOT NULL,
    tamanio_bytes               BIGINT,
    hash_sha256                 VARCHAR(64),
    empleado_id                 BIGINT,
    privilegio_lectura_codigo   VARCHAR(80),
    privilegio_descarga_codigo  VARCHAR(80),
    subido_por_id               BIGINT NOT NULL,
    estado                      seguridad.estado_archivo NOT NULL DEFAULT 'PENDIENTE_SUBIDA',
    created_at                  TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT fk_archivo_empleado  FOREIGN KEY (empleado_id)   REFERENCES public.empleados (id),
    CONSTRAINT fk_archivo_subido_por FOREIGN KEY (subido_por_id) REFERENCES public.usuarios (id)
);
CREATE INDEX IF NOT EXISTS idx_archivo_empleado_categoria ON seguridad.archivo (empleado_id, categoria);
CREATE INDEX IF NOT EXISTS idx_archivo_categoria_estado   ON seguridad.archivo (categoria, estado);

-- ─── CANAL_EMPLEADO (mapeo Telegram/WhatsApp ↔ empleado) ─────────
CREATE TABLE IF NOT EXISTS seguridad.canal_empleado (
    id            BIGSERIAL PRIMARY KEY,
    empleado_id   BIGINT NOT NULL,
    tipo_canal    seguridad.tipo_canal NOT NULL,
    identificador VARCHAR(200) NOT NULL,
    verificado    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT fk_canal_empleado FOREIGN KEY (empleado_id) REFERENCES public.empleados (id),
    CONSTRAINT uq_canal_tipo_identificador UNIQUE (tipo_canal, identificador)
);
CREATE INDEX IF NOT EXISTS idx_canal_empleado ON seguridad.canal_empleado (empleado_id);

-- ─── JUSTIFICACION_AUSENCIA ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.justificacion_ausencia (
    id                  BIGSERIAL PRIMARY KEY,
    empleado_id         BIGINT NOT NULL,
    tipo_canal          seguridad.tipo_canal NOT NULL,
    identificador_canal VARCHAR(200) NOT NULL,
    mensaje_original    TEXT,
    archivo_id          BIGINT,
    estado              seguridad.estado_justificacion NOT NULL DEFAULT 'PENDIENTE',
    jefe_usuario_id     BIGINT,
    comentario_jefe     VARCHAR(500),
    created_at          TIMESTAMP(6) NOT NULL DEFAULT now(),
    resolved_at         TIMESTAMP(6),
    CONSTRAINT fk_just_empleado FOREIGN KEY (empleado_id)     REFERENCES public.empleados (id),
    CONSTRAINT fk_just_archivo  FOREIGN KEY (archivo_id)      REFERENCES seguridad.archivo (id),
    CONSTRAINT fk_just_jefe     FOREIGN KEY (jefe_usuario_id) REFERENCES public.usuarios (id)
);
CREATE INDEX IF NOT EXISTS idx_just_estado_created  ON seguridad.justificacion_ausencia (estado, created_at);
CREATE INDEX IF NOT EXISTS idx_just_empleado        ON seguridad.justificacion_ausencia (empleado_id);
