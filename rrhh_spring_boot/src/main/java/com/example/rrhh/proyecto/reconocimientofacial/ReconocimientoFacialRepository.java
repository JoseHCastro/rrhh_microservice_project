package com.example.rrhh.proyecto.reconocimientofacial;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReconocimientoFacialRepository extends JpaRepository<ReconocimientoFacial, Long> {
    Optional<ReconocimientoFacial> findByCodigoFacial(String codigoFacial);
    Optional<ReconocimientoFacial> findByEmpleadoId(Long empleadoId);
    boolean existsByEmpleadoId(Long empleadoId);
}
