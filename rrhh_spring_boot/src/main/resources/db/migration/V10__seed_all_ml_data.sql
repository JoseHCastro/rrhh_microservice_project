-- V10: Semilla de datos faltantes para Machine Learning (Completar a todos los empleados)

-- 1. Actualizar a todos los empleados que tengan fecha_nacimiento nula
UPDATE empleados 
SET 
    -- Genera una fecha de nacimiento aleatoria entre 1970 y 2000
    fecha_nacimiento = '1970-01-01'::DATE + trunc(random() * 365 * 30)::INT,
    
    -- Genera un género aleatorio
    genero = CASE WHEN random() < 0.5 THEN 'MASCULINO' ELSE 'FEMENINO' END,
    
    -- Genera una ubicación GPS aleatoria cerca de La Paz (-16.5xxx, -68.1xxx)
    ubicacion_hogar_gps = 
        (-16.5 - (random() * 0.1))::NUMERIC(10,6)::TEXT || ',' || 
        (-68.1 - (random() * 0.1))::NUMERIC(10,6)::TEXT
WHERE fecha_nacimiento IS NULL;

-- 2. Insertar Evaluaciones de Desempeño aleatorias (1 a 100) para todos los empleados activos
-- que aún no tengan evaluación (el emp 1 y 2 ya tienen en V8, pero no hace daño darles otra)
INSERT INTO evaluaciones_desempeno (empleado_id, puntuacion, fecha_evaluacion, comentarios, evaluador_id)
SELECT 
    id, 
    trunc(random() * 50 + 50)::INT, -- Puntuación entre 50 y 100
    CURRENT_DATE - trunc(random() * 100)::INT, -- Fecha en los últimos 100 días
    'Evaluación generada automáticamente',
    1 -- Evaluado por admin
FROM empleados
WHERE id NOT IN (SELECT empleado_id FROM evaluaciones_desempeno);
