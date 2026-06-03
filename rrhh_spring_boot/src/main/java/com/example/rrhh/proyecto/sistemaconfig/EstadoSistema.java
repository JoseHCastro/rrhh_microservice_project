package com.example.rrhh.proyecto.sistemaconfig;

public enum EstadoSistema {
    EMPAREJAR,    // Sensor esperando enrolamiento de nuevo empleado
    EMPAREJADO,   // Enrolamiento facial completado
    LECTURA,      // Sensor listo para leer marcación diaria
    REGISTRADO    // Marcación registrada exitosamente
}
