package com.example.rrhh.proyecto.empleado;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    // Filtro combinado con JOIN FETCH para cargar departamento y cargo en 1 query
    @Query("""
        SELECT e FROM Empleado e
        JOIN FETCH e.departamento d
        JOIN FETCH e.cargo c
        LEFT JOIN FETCH e.supervisor s
        WHERE (:estado IS NULL OR e.estado = :estado)
          AND (:departamentoId IS NULL OR d.id = :departamentoId)
    """)
    Page<Empleado> findAllWithFilters(
        @Param("estado") EstadoEmpleado estado,
        @Param("departamentoId") Long departamentoId,
        Pageable pageable
    );

    Optional<Empleado> findByCarnetIdentidad(String carnetIdentidad);

    boolean existsByCarnetIdentidad(String carnetIdentidad);
}
