-- V8: Datos Semilla para probar Machine Learning

-- 1. Actualizar datos de los empleados existentes con features demográficos
UPDATE empleados 
SET 
    fecha_nacimiento = '1990-05-15',
    genero = 'MASCULINO',
    ubicacion_hogar_gps = '-16.500000,-68.119293', -- Centro de La Paz
    fecha_salida = NULL,
    motivo_salida = NULL
WHERE id = 1;

UPDATE empleados 
SET 
    fecha_nacimiento = '1995-10-20',
    genero = 'FEMENINO',
    ubicacion_hogar_gps = '-16.512300,-68.121300', -- Otra ubicación en La Paz
    fecha_salida = NULL,
    motivo_salida = NULL
WHERE id = 2;

-- Agregar un exempleado para tener datos de rotación
INSERT INTO empleados (nombre, apellido, fecha_contratacion, estado, departamento_id, cargo_id, hora_entrada, hora_salida, fecha_nacimiento, genero, ubicacion_hogar_gps, fecha_salida, motivo_salida)
VALUES ('Carlos', 'Ex-Empleado', '2023-01-10', 'INACTIVO', 1, 1, '08:00:00', '17:00:00', '1988-02-28', 'MASCULINO', '-16.495000,-68.135000', '2023-11-30', 'Mejor oferta laboral');

-- 2. Insertar Evaluaciones de Desempeño
INSERT INTO evaluaciones_desempeno (empleado_id, puntuacion, fecha_evaluacion, comentarios, evaluador_id)
VALUES 
    (1, 85, '2023-12-01', 'Buen desempeño general', 1),
    (2, 45, '2023-12-01', 'Rendimiento bajo este semestre', 1),
    (3, 90, '2023-06-01', 'Excelente', 1);

-- 3. (Opcional) Las preplanillas ya insertadas en scripts anteriores o generadas por el sistema
-- tendrán campos "faltas". Por ahora asumiremos que el id 2 tiene 5 faltas.
UPDATE preplanillas SET faltas = 5 WHERE empleado_id = 2;
