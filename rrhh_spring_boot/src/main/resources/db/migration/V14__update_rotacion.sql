-- V14: Añadir datos de rotación (Turnover) a los empleados generados
-- Convierte el 15% de los empleados activos (aprox 750) a INACTIVOS 
-- asignando fecha y motivo de salida. Esto servirá para entrenar futuros modelos de Rotación.

DO $$ 
DECLARE
    emp RECORD;
    random_days INT;
    random_motivo VARCHAR;
    motivos VARCHAR[] := ARRAY['Renuncia Voluntaria', 'Mejor Oferta Laboral', 'Bajo Desempeño', 'Motivos Personales'];
BEGIN
    FOR emp IN 
        SELECT id, fecha_contratacion 
        FROM empleados 
        WHERE estado = 'ACTIVO' AND nombre LIKE 'Emp%'
        ORDER BY random() 
        LIMIT 750 
    LOOP
        -- Fecha de salida: Un número aleatorio de días después de la contratación (y antes de hoy)
        random_days := floor(random() * (CURRENT_DATE - emp.fecha_contratacion));
        -- Prevenir fechas de salida iguales a la contratación
        IF random_days < 10 THEN
            random_days := 30;
        END IF;

        -- Seleccionar motivo aleatorio del array
        random_motivo := motivos[floor(random() * 4) + 1];

        UPDATE empleados 
        SET estado = 'INACTIVO',
            fecha_salida = emp.fecha_contratacion + random_days,
            motivo_salida = random_motivo
        WHERE id = emp.id;
    END LOOP;
END $$;
