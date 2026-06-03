package com.example.rrhh.proyecto.ausencia.tipoausencia;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class TipoAusenciaResolver {

    private final TipoAusenciaService tipoAusenciaService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<TipoAusencia> tiposAusencia() {
        return tipoAusenciaService.findAll();
    }
}
