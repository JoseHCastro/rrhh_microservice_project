package com.example.rrhh.proyecto.scheduler;

import com.example.rrhh.proyecto.asistencia.EstadoAsistencia;
import com.example.rrhh.proyecto.asistencia.EstadoPlanilla;
import com.example.rrhh.proyecto.asistencia.RegistroAsistencia;
import com.example.rrhh.proyecto.asistencia.RegistroAsistenciaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final RegistroAsistenciaRepository registroRepository;

    /**
     * CRON nocturno a las 23:55 todos los días.
     * Detecta empleados que marcaron entrada pero olvidaron marcar salida,
     * cerrando su registro y marcando la planilla como OBSERVADA.
     */
    @Scheduled(cron = "0 55 23 * * ?")
    @Transactional
    public void detectarInconsistenciasAsistencia() {
        log.info("Iniciando CRON nocturno: detectando marcaciones sin salida");

        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = inicioDia.plusDays(1);

        List<RegistroAsistencia> sinSalida = registroRepository.findSinSalidaDelDia(inicioDia, finDia);

        if (sinSalida.isEmpty()) {
            log.info("CRON nocturno: No se encontraron marcaciones sin salida hoy");
            return;
        }

        for (RegistroAsistencia registro : sinSalida) {
            // Se asume la hora de salida configurada en el empleado o se marca a la hora del cron
            registro.setHoraSalida(LocalDateTime.now());
            registro.setEstado(EstadoAsistencia.MARCACION_OBSERVADA);
            registro.setEstadoPlanilla(EstadoPlanilla.OBSERVADO);
            
            log.warn("Registro observado: empleado_id={} olvidó marcar salida",
                registro.getEmpleado().getId());
        }

        registroRepository.saveAll(sinSalida);
        log.info("CRON nocturno finalizado: {} registros observados", sinSalida.size());
    }

    /**
     * CRON fin de mes para generar preplanillas automáticas (Ej: día 1 a las 01:00 am).
     * @Scheduled(cron = "0 0 1 1 * ?")
     */
    public void generarPreplanillasFinDeMes() {
        // Lógica para iterar empleados y llamar a PreplanillaService.generar(...)
    }
}
