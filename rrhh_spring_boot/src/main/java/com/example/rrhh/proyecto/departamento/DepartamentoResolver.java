package com.example.rrhh.proyecto.departamento;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DepartamentoResolver {

    private final DepartamentoService departamentoService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Departamento> departamentos() {
        return departamentoService.findAll();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Departamento departamento(@Argument Long id) {
        return departamentoService.findById(id);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public Departamento crearDepartamento(@Argument String nombre) {
        return departamentoService.crear(nombre);
    }
}
