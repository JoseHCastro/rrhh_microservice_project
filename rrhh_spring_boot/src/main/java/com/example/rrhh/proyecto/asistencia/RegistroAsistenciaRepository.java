package com.example.rrhh.proyecto.asistencia;

import com.example.rrhh.proyecto.empleado.Empleado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RegistroAsistenciaRepository extends JpaRepository<RegistroAsistencia, Long> {

    boolean existsByEmpleadoAndHoraEntradaAfter(Empleado empleado, LocalDateTime desde);

    Optional<RegistroAsistencia> findByEmpleadoAndHoraEntradaAfterAndHoraSalidaIsNull(
        Empleado empleado, LocalDateTime desde
    );

    @Query("""
        SELECT r FROM RegistroAsistencia r
        JOIN FETCH r.empleado e
        WHERE (:empleadoId IS NULL OR e.id = :empleadoId)
          AND (:desde IS NULL OR r.horaEntrada >= :desde)
          AND (:hasta IS NULL OR r.horaEntrada <= :hasta)
        ORDER BY r.horaEntrada DESC
    """)
    Page<RegistroAsistencia> findByEmpleadoIdAndRango(
        @Param("empleadoId") Long empleadoId,
        @Param("desde") LocalDateTime desde,
        @Param("hasta") LocalDateTime hasta,
        Pageable pageable
    );

    // Para el CRON nocturno: registros sin salida del día anterior
    @Query("""
        SELECT r FROM RegistroAsistencia r
        WHERE r.horaSalida IS NULL
          AND r.horaEntrada >= :inicioDia
          AND r.horaEntrada < :finDia
    """)
    List<RegistroAsistencia> findSinSalidaDelDia(
        @Param("inicioDia") LocalDateTime inicioDia,
        @Param("finDia") LocalDateTime finDia
    );
}
