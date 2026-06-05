package com.example.rrhh.proyecto.departamento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
    boolean existsByNombre(String nombre);

    // Trae el gerente (LAZY) en la misma query para poder serializarlo en GraphQL
    // con open-in-view=false. LEFT JOIN porque el gerente es opcional.
    @Query("SELECT d FROM Departamento d LEFT JOIN FETCH d.gerente g")
    List<Departamento> findAllWithGerente();
}
