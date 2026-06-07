-- ════════════════════════════════════════════════════════════════
-- Módulo 3 — v3: registrar el MOTIVO cuando el análisis de IA falla.
-- Aditiva e idempotente.
--   npx prisma db execute --file prisma/sql/seguridad_v3_ia_error.sql --schema prisma/schema.prisma
-- ════════════════════════════════════════════════════════════════

ALTER TABLE seguridad.justificacion_ausencia
    ADD COLUMN IF NOT EXISTS ia_error VARCHAR(500);
