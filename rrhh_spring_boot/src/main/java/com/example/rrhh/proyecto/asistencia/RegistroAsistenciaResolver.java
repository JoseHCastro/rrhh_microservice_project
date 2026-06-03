package com.example.rrhh.proyecto.asistencia;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class RegistroAsistenciaResolver {

    private final RegistroAsistenciaService asistenciaService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> registrosAsistencia(
        @Argument Long empleadoId,
        @Argument LocalDateTime desde,
        @Argument LocalDateTime hasta,
        @Argument Integer page,
        @Argument Integer size
    ) {
        int pageNum  = page != null ? page : 0;
        int pageSize = size != null ? size : 20;

        Page<RegistroAsistencia> pageResult = asistenciaService.findByEmpleadoAndRango(
            empleadoId, desde, hasta, pageNum, pageSize
        );

        return Map.of(
            "content", pageResult.getContent(),
            "pageInfo", Map.of(
                "totalElements", pageResult.getTotalElements(),
                "totalPages",    pageResult.getTotalPages(),
                "currentPage",   pageResult.getNumber(),
                "pageSize",      pageResult.getSize(),
                "hasNext",       pageResult.hasNext()
            )
        );
    }

    @MutationMapping
    public RegistroAsistencia registrarEntrada(@Argument RegistroAsistenciaInput input) {
        return asistenciaService.registrarEntrada(input.codigoFacial(), input.ubicacionGps());
    }

    @MutationMapping
    public RegistroAsistencia registrarSalida(@Argument String codigoFacial) {
        return asistenciaService.registrarSalida(codigoFacial);
    }

    public record RegistroAsistenciaInput(String codigoFacial, String ubicacionGps) {}
}
