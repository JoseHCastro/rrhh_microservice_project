package com.example.rrhh.proyecto.cargo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CargoRepository extends JpaRepository<Cargo, Long> {
    boolean existsByNombre(String nombre);
}
