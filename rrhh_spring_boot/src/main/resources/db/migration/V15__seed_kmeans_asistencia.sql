-- V15: Seeder de Asistencia Histórica para Entrenamiento de K-Means
-- Genera 5,000 registros biométricos de marcación GPS
-- Incluye un 5% de marcaciones anómalas (fraude GPS o de horario) para enseñar al modelo a detectar anomalías.

DO $$ 
DECLARE
    i INT;
    random_emp_id BIGINT;
    is_anomaly BOOLEAN;
    base_lat NUMERIC := -16.5000;
    base_lon NUMERIC := -68.1200;
    rand_lat NUMERIC;
    rand_lon NUMERIC;
    rand_days INT;
    rand_minutes INT;
    fecha_marcacion TIMESTAMP;
    estado_marcacion VARCHAR;
    emp_count INT;
    es_anomalo_var BOOLEAN;
    score_var NUMERIC;
BEGIN
    -- Validar que existan empleados
    SELECT COUNT(*) INTO emp_count FROM empleados WHERE estado = 'ACTIVO';
    IF emp_count = 0 THEN
        RETURN; -- Si no hay empleados, abortar la inserción
    END IF;

    -- Vaciar la tabla para asegurar que son exactamente 5,000 limpios para el entrenamiento actual
    -- (Opcional, pero recomendado si se re-hace el seeder)
    TRUNCATE TABLE registro_asistencia CASCADE;

    FOR i IN 1..5000 LOOP
        -- Seleccionar un empleado aleatorio (se usa offset por eficiencia en scripts pequeños)
        SELECT id INTO random_emp_id FROM empleados WHERE estado = 'ACTIVO' ORDER BY random() LIMIT 1;
        
        -- Decidir si esta marcación será una "Anomalía" (5% de probabilidad)
        is_anomaly := random() < 0.05;

        -- Días aleatorios en el pasado (hasta 90 días atrás)
        rand_days := floor(random() * 90);
        
        IF NOT is_anomaly THEN
            es_anomalo_var := FALSE;
            score_var := random() * 20.0 + 5.0;
            -- COMPORTAMIENTO NORMAL
            -- Latitud y Longitud cerca a la oficina central (ruido de unos pocos metros)
            rand_lat := base_lat + (random() * 0.002 - 0.001);
            rand_lon := base_lon + (random() * 0.002 - 0.001);
            
            -- Hora de entrada normal: entre las 07:45 AM y las 08:30 AM
            rand_minutes := floor(random() * 45);
            fecha_marcacion := (CURRENT_DATE - rand_days) + time '07:45' + (rand_minutes || ' minutes')::interval;
            
            -- Si llega después de las 08:00 AM (07:45 + 15m), es RETRASO
            IF rand_minutes > 15 THEN
                estado_marcacion := 'RETRASO';
            ELSE
                estado_marcacion := 'REGISTRADO';
            END IF;
        ELSE
            es_anomalo_var := TRUE;
            score_var := 80.0 + (random() * 20.0);
            -- COMPORTAMIENTO ANÓMALO (Fraude)
            -- Puede ser un fraude de GPS (marcación desde otro país o ciudad muy lejana)
            IF random() < 0.5 THEN
                -- Marcación en Europa o Asia
                rand_lat := 40.0 + (random() * 20.0);
                rand_lon := 10.0 + (random() * 30.0);
                -- Horario normal para engañar
                rand_minutes := floor(random() * 45);
                fecha_marcacion := (CURRENT_DATE - rand_days) + time '07:45' + (rand_minutes || ' minutes')::interval;
            ELSE
                -- Fraude de Horario (Marcando asistencia en la madrugada)
                rand_lat := base_lat + (random() * 0.002 - 0.001);
                rand_lon := base_lon + (random() * 0.002 - 0.001);
                -- Hora anómala: 03:00 AM
                rand_minutes := floor(random() * 60);
                fecha_marcacion := (CURRENT_DATE - rand_days) + time '03:00' + (rand_minutes || ' minutes')::interval;
            END IF;
            
            -- Algunas anomalías son detectadas en el acto
            IF random() < 0.3 THEN
                estado_marcacion := 'MARCACION_OBSERVADA';
            ELSIF rand_minutes > 15 THEN
                estado_marcacion := 'RETRASO';
            ELSE
                estado_marcacion := 'REGISTRADO';
            END IF;
        END IF;

        -- Insertar el registro de entrada
        INSERT INTO registro_asistencia (
            empleado_id, 
            hora_entrada, 
            ubicacion_gps, 
            estado, 
            estado_planilla,
            es_anomalo,
            anomalia_score
        ) VALUES (
            random_emp_id,
            fecha_marcacion,
            round(rand_lat, 6) || ',' || round(rand_lon, 6),
            estado_marcacion,
            CASE WHEN estado_marcacion = 'MARCACION_OBSERVADA' THEN 'OBSERVADO' ELSE 'NORMAL' END,
            es_anomalo_var,
            round(score_var, 2)
        );
    END LOOP;
END $$;
