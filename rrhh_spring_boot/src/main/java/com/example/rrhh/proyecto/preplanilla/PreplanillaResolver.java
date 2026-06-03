package com.example.rrhh.proyecto.preplanilla;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class PreplanillaResolver {

    private final PreplanillaService preplanillaService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Preplanilla> preplanillas(
        @Argument Long empleadoId,
        @Argument String periodo
    ) {
        return preplanillaService.findAll(empleadoId, periodo);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Preplanilla preplanilla(@Argument Long id) {
        return preplanillaService.findById(id);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public Preplanilla generarPreplanilla(
        @Argument Long empleadoId,
        @Argument String periodo
    ) {
        return preplanillaService.generar(empleadoId, periodo);
    }
}
