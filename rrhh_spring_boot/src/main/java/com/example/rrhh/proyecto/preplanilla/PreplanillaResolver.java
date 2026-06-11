package com.example.rrhh.proyecto.preplanilla;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class PreplanillaResolver {

    private final PreplanillaService preplanillaService;
    private final Optional<S3Service> s3Service;

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

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public String urlDescargaPreplanilla(@Argument Long id) {
        Preplanilla preplanilla = preplanillaService.findById(id);
        if (preplanilla.getS3KeyUri() == null || preplanilla.getS3KeyUri().isBlank()) {
            throw new RuntimeException("El PDF de esta preplanilla no está disponible.");
        }
        return s3Service.map(s3 -> s3.generarUrlPresignada(preplanilla.getS3KeyUri()))
            .orElseThrow(() -> new RuntimeException("Servicio de almacenamiento (S3) no habilitado."));
    }

    @QueryMapping
    // No requiere @PreAuthorize porque queremos que la verificación sea pública / abierta
    public Preplanilla verificarPreplanilla(@Argument String hashDocumento) {
        return preplanillaService.verificarPorHash(hashDocumento)
            .orElseThrow(() -> new RuntimeException("El hash del documento no coincide con ningún registro válido en el sistema."));
    }
}
