-- V13: Seeder Inteligente para Machine Learning (Random Forest)
-- Este script inserta 5000 empleados aleatorios con métricas variables de desempeño y ausentismo.

DO $$ 
DECLARE
    i INT;
    random_rendimiento INT;
    random_faltas INT;
    random_lat NUMERIC;
    random_lon NUMERIC;
    random_fecha_nac DATE;
    random_fecha_cont DATE;
    random_gen VARCHAR;
    rand_dept NUMERIC;
    emp_id BIGINT;
    dep_id BIGINT;
    car_id BIGINT;
BEGIN
    -- Asegurar Departamento de ML
    SELECT id INTO dep_id FROM departamentos WHERE nombre = 'ML Dept' LIMIT 1;
    IF dep_id IS NULL THEN
        INSERT INTO departamentos (nombre, ubicacion_gps) VALUES ('ML Dept', '-16.5000,-68.1200') RETURNING id INTO dep_id;
    END IF;

    -- Asegurar Cargo de ML
    SELECT id INTO car_id FROM cargos WHERE nombre = 'ML Cargo' LIMIT 1;
    IF car_id IS NULL THEN
        INSERT INTO cargos (nombre, salario_por_hora) VALUES ('ML Cargo', 15.0) RETURNING id INTO car_id;
    END IF;

    -- Inyectar 5000 registros
    FOR i IN 1..5000 LOOP
        -- Variación geográfica (+- 0.05 lat/lon approx 5km radius)
        random_lat := -16.5000 + (random() * 0.1 - 0.05);
        random_lon := -68.1200 + (random() * 0.1 - 0.05);
        
        -- Escoger departamento basado en una distribución ponderada (para gráficos realistas)
        rand_dept := random();
        IF rand_dept < 0.40 THEN
            SELECT id INTO dep_id FROM departamentos WHERE nombre = 'Comercial & Ventas' LIMIT 1;
        ELSIF rand_dept < 0.70 THEN
            SELECT id INTO dep_id FROM departamentos WHERE nombre = 'Operaciones & Logística' LIMIT 1;
        ELSIF rand_dept < 0.85 THEN
            SELECT id INTO dep_id FROM departamentos WHERE nombre = 'Tecnología e Innovación' LIMIT 1;
        ELSIF rand_dept < 0.95 THEN
            SELECT id INTO dep_id FROM departamentos WHERE nombre = 'Recursos Humanos' LIMIT 1;
        ELSE
            SELECT id INTO dep_id FROM departamentos WHERE nombre = 'ML Dept' LIMIT 1;
        END IF;
        
        -- Fallback por si algún departamento no existiera
        IF dep_id IS NULL THEN
            SELECT id INTO dep_id FROM departamentos ORDER BY random() LIMIT 1;
        END IF;

        -- Escoger cargo aleatorio
        SELECT id INTO car_id FROM cargos ORDER BY random() LIMIT 1;
        
        -- Edad aleatoria: 20 a 50 años (7300 a 18000 días)
        random_fecha_nac := CURRENT_DATE - (random() * 10700 + 7300)::INT; 
        
        -- Contratado en los últimos 5 años
        random_fecha_cont := CURRENT_DATE - (random() * 1800)::INT; 
        
        -- Género aleatorio
        IF random() > 0.5 THEN
            random_gen := 'MASCULINO';
        ELSE
            random_gen := 'FEMENINO';
        END IF;

        -- 1. Insertar Empleado
        INSERT INTO empleados (
            nombre, apellido, estado, departamento_id, cargo_id, 
            hora_entrada, hora_salida, fecha_contratacion, 
            fecha_nacimiento, genero, ubicacion_hogar_gps
        ) VALUES (
            'Emp'||i, 'ML', 'ACTIVO', dep_id, car_id, 
            '08:00', '17:00', random_fecha_cont, 
            random_fecha_nac, random_gen, random_lat || ',' || random_lon
        ) RETURNING id INTO emp_id;

        -- 2. Insertar Evaluación de Desempeño
        -- 80% rinden bien (70-100), 20% bajo rendimiento (30-69)
        IF random() > 0.2 THEN
            random_rendimiento := floor(random() * 30 + 70);
        ELSE
            random_rendimiento := floor(random() * 39 + 30);
        END IF;

        INSERT INTO evaluaciones_desempeno (empleado_id, puntuacion, fecha_evaluacion) 
        VALUES (emp_id, random_rendimiento, CURRENT_DATE);

        -- 3. Insertar Preplanilla (Faltas)
        -- Si rendimiento es bajo, tienden a tener más faltas (2 a 6 faltas)
        IF random_rendimiento < 60 THEN
            random_faltas := floor(random() * 5 + 2);
        ELSE
            -- Buen rendimiento: 90% no falta, 10% falta 1-2 veces
            IF random() > 0.1 THEN
                random_faltas := 0;
            ELSE
                random_faltas := floor(random() * 2 + 1);
            END IF;
        END IF;

        INSERT INTO preplanillas (
            empleado_id, periodo, dias_trabajados, faltas, retrasos, permisos_aprobados, 
            licencias, horas_extra, marcaciones_observadas, fecha_creacion
        ) VALUES (
            emp_id, '2026-05', 22 - random_faltas, random_faltas, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP
        );
        
    END LOOP;
END $$;
