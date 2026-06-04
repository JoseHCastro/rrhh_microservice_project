package com.example.rrhh.proyecto.ausencia.solicitud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SolicitudAusenciaRepository extends JpaRepository<SolicitudAusencia, Long> {

    @Query("""
        SELECT s FROM SolicitudAusencia s
        JOIN FETCH s.empleado
        JOIN FETCH s.tipoAusencia
        LEFT JOIN FETCH s.aprobador
        WHERE (:estado IS NULL OR s.estado = :estado)
          AND (:empleadoId IS NULL OR s.empleado.id = :empleadoId)
        ORDER BY s.fechaSolicitud DESC
    """)
    List<SolicitudAusencia> findAllWithFilters(
        @Param("estado") EstadoSolicitud estado,
        @Param("empleadoId") Long empleadoId
    );

    // Validación de solapamiento de fechas
    @Query("""
        SELECT COUNT(s) > 0 FROM SolicitudAusencia s
        WHERE s.empleado.id = :empleadoId
          AND s.estado <> com.example.rrhh.proyecto.ausencia.solicitud.EstadoSolicitud.RECHAZADA
          AND s.fechaInicio <= :fin
          AND s.fechaFin   >= :inicio
    """)
    boolean existeConflictoFechas(
        @Param("empleadoId") Long empleadoId,
        @Param("inicio") LocalDate inicio,
        @Param("fin") LocalDate fin
    );
}
