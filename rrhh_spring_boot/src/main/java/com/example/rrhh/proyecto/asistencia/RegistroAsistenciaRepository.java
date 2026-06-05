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

    // NOTA: no usamos "(:desde IS NULL OR ...)" porque PostgreSQL no puede inferir
    // el tipo de un parámetro timestamp dentro de "$x IS NULL" (sí lo hace con Long).
    // El servicio garantiza desde/hasta no nulos (rango amplio por defecto).
    @Query("""
        SELECT r FROM RegistroAsistencia r
        JOIN FETCH r.empleado e
        WHERE (:empleadoId IS NULL OR e.id = :empleadoId)
          AND r.horaEntrada >= :desde
          AND r.horaEntrada <= :hasta
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
