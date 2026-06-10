-- V9: Añadir ubicación GPS a los departamentos para calcular distancia en Random Forest
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS ubicacion_gps VARCHAR(50);

-- Actualizar los departamentos existentes con una ubicación de ejemplo (ej. Oficina Central)
UPDATE departamentos SET ubicacion_gps = '-16.500000,-68.119293' WHERE id = 1;
UPDATE departamentos SET ubicacion_gps = '-16.500000,-68.119293' WHERE ubicacion_gps IS NULL;
