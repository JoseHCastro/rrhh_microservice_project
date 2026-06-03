package com.example.rrhh.proyecto.sistemaconfig;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SistemaConfigResolver {

    private final SistemaConfigService sistemaConfigService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public SistemaConfig sistemaConfigEstado() {
        return sistemaConfigService.getEstadoActual().orElse(null);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public SistemaConfig cambiarEstadoSistema(@Argument EstadoSistema estado) {
        return sistemaConfigService.cambiarEstado(estado);
    }
}
