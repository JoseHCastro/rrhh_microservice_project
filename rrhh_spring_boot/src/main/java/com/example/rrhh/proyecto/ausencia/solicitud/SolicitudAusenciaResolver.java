package com.example.rrhh.proyecto.ausencia.solicitud;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class SolicitudAusenciaResolver {

    private final SolicitudAusenciaService solicitudService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<SolicitudAusencia> solicitudesAusencia(
        @Argument EstadoSolicitud estado,
        @Argument Long empleadoId
    ) {
        return solicitudService.findAll(estado, empleadoId);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public SolicitudAusencia crearSolicitudAusencia(@Argument SolicitudAusenciaInput input) {
        return solicitudService.crear(
            input.empleadoId(),
            input.tipoAusenciaId(),
            input.fechaInicio(),
            input.fechaFin()
        );
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH', 'SUPERVISOR')")
    public SolicitudAusencia aprobarSolicitudAusencia(@Argument Long id) {
        return solicitudService.aprobar(id);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH', 'SUPERVISOR')")
    public SolicitudAusencia rechazarSolicitudAusencia(@Argument Long id) {
        return solicitudService.rechazar(id);
    }

    public record SolicitudAusenciaInput(
        Long empleadoId,
        Long tipoAusenciaId,
        LocalDate fechaInicio,
        LocalDate fechaFin
    ) {}
}
