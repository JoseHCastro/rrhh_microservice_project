package com.example.rrhh.proyecto.preplanilla;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PreplanillaRepository extends JpaRepository<Preplanilla, Long> {

    @Query("""
        SELECT p FROM Preplanilla p
        JOIN FETCH p.empleado e
        WHERE (:empleadoId IS NULL OR e.id = :empleadoId)
          AND (:periodo IS NULL OR p.periodo = :periodo)
        ORDER BY p.periodo DESC
    """)
    List<Preplanilla> findAllWithFilters(
        @Param("empleadoId") Long empleadoId,
        @Param("periodo") String periodo
    );

    Optional<Preplanilla> findByEmpleadoIdAndPeriodo(Long empleadoId, String periodo);

    @Query("SELECT p FROM Preplanilla p JOIN FETCH p.empleado WHERE p.documentoHash = :documentoHash")
    Optional<Preplanilla> findByDocumentoHash(@Param("documentoHash") String documentoHash);
}
