-- ════════════════════════════════════════════════════════════════
-- Módulo 3 — v4: auto-registro de canal por código de vinculación.
-- Aditiva e idempotente.
--   npx prisma db execute --file prisma/sql/seguridad_v4_codigo_vinculacion.sql --schema prisma/schema.prisma
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS seguridad.codigo_vinculacion (
    id          BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    codigo_hash VARCHAR(64) NOT NULL,
    tipo_canal  seguridad.tipo_canal NOT NULL,
    expires_at  TIMESTAMP(6) NOT NULL,
    used_at     TIMESTAMP(6),
    created_at  TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT fk_codvinc_empleado FOREIGN KEY (empleado_id) REFERENCES public.empleados (id)
);
CREATE INDEX IF NOT EXISTS idx_codvinc_hash     ON seguridad.codigo_vinculacion (codigo_hash);
CREATE INDEX IF NOT EXISTS idx_codvinc_empleado ON seguridad.codigo_vinculacion (empleado_id, created_at);
