package com.example.rrhh.proyecto.reconocimientofacial;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ReconocimientoFacialResolver {

    private final ReconocimientoFacialService rfService;

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public ReconocimientoFacial enrolarRostro(
        @Argument Long empleadoId,
        @Argument String codigoFacial
    ) {
        return rfService.enrolar(empleadoId, codigoFacial);
    }
}
