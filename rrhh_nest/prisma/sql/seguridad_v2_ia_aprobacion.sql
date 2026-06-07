-- ════════════════════════════════════════════════════════════════
-- Módulo 3 — v2: Análisis IA + aprobación segura por token
--
-- Aditiva e idempotente. Aplica sobre una DB que ya tenga seguridad_init.sql.
--   npx prisma db execute --file prisma/sql/seguridad_v2_ia_aprobacion.sql --schema prisma/schema.prisma
-- ════════════════════════════════════════════════════════════════

-- ─── Enum de acción del token ────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE seguridad.accion_token AS ENUM ('APROBAR', 'RECHAZAR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Campos de análisis IA en justificacion_ausencia ─────────────
ALTER TABLE seguridad.justificacion_ausencia
    ADD COLUMN IF NOT EXISTS ia_analizado        BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS documento_valido_ia BOOLEAN,
    ADD COLUMN IF NOT EXISTS tipo_sugerido_ia    VARCHAR(60),
    ADD COLUMN IF NOT EXISTS dias_reposo_ia      INT,
    ADD COLUMN IF NOT EXISTS diagnostico_ia      VARCHAR(500),
    ADD COLUMN IF NOT EXISTS resumen_ia          TEXT,
    ADD COLUMN IF NOT EXISTS recomendacion_ia    VARCHAR(20),
    ADD COLUMN IF NOT EXISTS confianza_ia        DOUBLE PRECISION;

-- ─── Tabla de tokens de aprobación (un solo uso) ─────────────────
CREATE TABLE IF NOT EXISTS seguridad.justificacion_token (
    id               BIGSERIAL PRIMARY KEY,
    justificacion_id BIGINT NOT NULL,
    accion           seguridad.accion_token NOT NULL,
    token_hash       VARCHAR(64) NOT NULL UNIQUE,
    expires_at       TIMESTAMP(6) NOT NULL,
    used_at          TIMESTAMP(6),
    created_at       TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT fk_jtoken_justificacion FOREIGN KEY (justificacion_id)
        REFERENCES seguridad.justificacion_ausencia (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_jtoken_justificacion ON seguridad.justificacion_token (justificacion_id);
