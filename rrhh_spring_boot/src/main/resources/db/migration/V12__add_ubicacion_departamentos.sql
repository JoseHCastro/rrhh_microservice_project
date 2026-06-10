ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS ubicacion_gps VARCHAR(255);

-- Update existing departments to Santa Cruz de la Sierra default coordinates
UPDATE departamentos SET ubicacion_gps = '-17.783300,-63.182100' WHERE ubicacion_gps IS NULL;
