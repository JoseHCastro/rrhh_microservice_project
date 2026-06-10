-- V7: Agregar features necesarias para modelos de Machine Learning

-- 1. Modificar la tabla 'empleados' para incluir features demográficos y de distancia
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS genero VARCHAR(20);
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS ubicacion_hogar_gps VARCHAR(50);

-- Variables para predecir rotación (Turnover)
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS fecha_salida DATE;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS motivo_salida VARCHAR(255);

-- 2. Modificar la tabla 'registro_asistencia' para almacenar el resultado de K-Means
ALTER TABLE registro_asistencia ADD COLUMN IF NOT EXISTS es_anomalo BOOLEAN DEFAULT FALSE;
ALTER TABLE registro_asistencia ADD COLUMN IF NOT EXISTS anomalia_score NUMERIC(5,2);

-- 3. Crear tabla para Evaluaciones de Desempeño
CREATE TABLE IF NOT EXISTS evaluaciones_desempeno (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    puntuacion INT NOT NULL CHECK (puntuacion >= 0 AND puntuacion <= 100),
    fecha_evaluacion DATE NOT NULL,
    comentarios TEXT,
    evaluador_id BIGINT,
    CONSTRAINT fk_ed_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id),
    CONSTRAINT fk_ed_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios (id)
);

-- 4. Crear tabla para almacenar las predicciones de Machine Learning
CREATE TABLE IF NOT EXISTS predicciones_ml (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL,
    probabilidad_ausentismo NUMERIC(5,4), -- 0.0000 to 1.0000
    probabilidad_rotacion NUMERIC(5,4),   -- 0.0000 to 1.0000
    fecha_prediccion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modelo_version VARCHAR(50),
    CONSTRAINT fk_pml_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id)
);
