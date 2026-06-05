package com.example.rrhh.proyecto.asistencia;

import com.example.rrhh.proyecto.empleado.Empleado;
import com.example.rrhh.proyecto.reconocimientofacial.ReconocimientoFacial;
import com.example.rrhh.proyecto.reconocimientofacial.ReconocimientoFacialRepository;
import com.example.rrhh.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistroAsistenciaService {

    private final RegistroAsistenciaRepository registroRepository;
    private final ReconocimientoFacialRepository rfRepository;

    /**
     * Flujo de ENTRADA — invocado por el sensor IoT.
     * 1. Busca el empleado por codigoFacial.
     * 2. Determina si hay retraso vs. la hora esperada del empleado.
     * 3. Registra la asistencia y devuelve el estado del sistema a REGISTRADO.
     */
    @Transactional
    public RegistroAsistencia registrarEntrada(String codigoFacial, String ubicacionGps) {
        ReconocimientoFacial rf = rfRepository.findByCodigoFacial(codigoFacial)
            .orElseThrow(() -> new BusinessException(
                "Código facial no reconocido: " + codigoFacial
            ));

        Empleado empleado = rf.getEmpleado();

        // Verificar si ya marcó hoy
        LocalDateTime hoy = LocalDate.now().atStartOfDay();
        boolean yaMarcó = registroRepository.existsByEmpleadoAndHoraEntradaAfter(empleado, hoy);
        if (yaMarcó) {
            throw new BusinessException(
                "El empleado " + empleado.getNombre() + " ya registró entrada hoy"
            );
        }

        // Calcular estado (RETRASO o REGISTRADO) — Margen de tolerancia: 15 minutos
        LocalDateTime ahora = LocalDateTime.now();
        LocalTime horaEsperada = empleado.getHoraEntrada().plusMinutes(15);
        EstadoAsistencia estado = ahora.toLocalTime().isAfter(horaEsperada)
            ? EstadoAsistencia.RETRASO
            : EstadoAsistencia.REGISTRADO;

        RegistroAsistencia registro = RegistroAsistencia.builder()
            .empleado(empleado)
            .horaEntrada(ahora)
            .ubicacionGps(ubicacionGps)
            .estado(estado)
            .estadoPlanilla(EstadoPlanilla.NORMAL)
            .build();

        RegistroAsistencia saved = registroRepository.save(registro);

        log.info("Entrada registrada: empleado_id={}, estado={}, hora={}",
            empleado.getId(), estado, ahora);

        return saved;
    }

    /**
     * Flujo de SALIDA — invocado por el sensor IoT.
     */
    @Transactional
    public RegistroAsistencia registrarSalida(String codigoFacial) {
        ReconocimientoFacial rf = rfRepository.findByCodigoFacial(codigoFacial)
            .orElseThrow(() -> new BusinessException(
                "Código facial no reconocido: " + codigoFacial
            ));

        Empleado empleado = rf.getEmpleado();
        LocalDateTime hoy = LocalDate.now().atStartOfDay();

        RegistroAsistencia registro = registroRepository
            .findByEmpleadoAndHoraEntradaAfterAndHoraSalidaIsNull(empleado, hoy)
            .orElseThrow(() -> new BusinessException(
                "No se encontró registro de entrada para hoy del empleado " + empleado.getNombre()
            ));

        registro.setHoraSalida(LocalDateTime.now());
        return registroRepository.save(registro);
    }

    @Transactional(readOnly = true)
    public Page<RegistroAsistencia> findByEmpleadoAndRango(
        Long empleadoId, LocalDateTime desde, LocalDateTime hasta, int page, int size
    ) {
        // PostgreSQL no infiere el tipo de un parámetro timestamp NULL dentro de
        // "(:desde IS NULL OR ...)" → "no se pudo determinar el tipo del parámetro".
        // Sustituimos los nulos por un rango amplio para que el bind tenga tipo.
        LocalDateTime desdeF = desde != null ? desde : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime hastaF = hasta != null ? hasta : LocalDateTime.of(2999, 12, 31, 23, 59);
        return registroRepository.findByEmpleadoIdAndRango(
            empleadoId, desdeF, hastaF,
            PageRequest.of(page, size)
        );
    }
}
