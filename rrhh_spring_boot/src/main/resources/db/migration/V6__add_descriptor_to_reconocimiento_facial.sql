-- V6: Extender tabla reconocimiento_facial para soportar embeddings biométricos reales
-- La tabla ya existía en V2 con codigo_facial (texto). Ahora añadimos el descriptor
-- vectorial (128 floats como JSON) para el reconocimiento facial real con face-api.js.

-- Agregar columna descriptor (TEXT) para el vector de 128 floats
ALTER TABLE reconocimiento_facial
    ADD COLUMN IF NOT EXISTS descriptor TEXT;

-- Hacer codigo_facial opcional (ya no es la fuente de verdad biométrica)
ALTER TABLE reconocimiento_facial
    ALTER COLUMN codigo_facial DROP NOT NULL;

-- Agregar columna activo para controlar cuál embedding es el vigente
ALTER TABLE reconocimiento_facial
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- Índice para búsquedas por empleado + activo
CREATE INDEX IF NOT EXISTS idx_rf_empleado_activo ON reconocimiento_facial(empleado_id, activo);
