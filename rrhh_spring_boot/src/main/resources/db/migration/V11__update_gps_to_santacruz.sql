-- V11: Migrar todas las coordenadas GPS a Santa Cruz de la Sierra

-- 1. Actualizar departamentos a Santa Cruz
UPDATE departamentos SET ubicacion_gps = '-17.783300,-63.182100';

-- 2. Actualizar empleados a Santa Cruz aleatoriamente
UPDATE empleados 
SET ubicacion_hogar_gps = 
    (-17.78 - (random() * 0.1))::NUMERIC(10,6)::TEXT || ',' || 
    (-63.18 - (random() * 0.1))::NUMERIC(10,6)::TEXT
WHERE ubicacion_hogar_gps IS NOT NULL;
