package com.example.rrhh.proyecto.sistemaconfig;

import com.example.rrhh.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SistemaConfigService {

    private final SistemaConfigRepository sistemaConfigRepository;

    @Transactional(readOnly = true)
    public Optional<SistemaConfig> getEstadoActual() {
        return sistemaConfigRepository.findAll().stream().findFirst();
    }

    @Transactional
    public SistemaConfig cambiarEstado(EstadoSistema nuevoEstado) {
        SistemaConfig config = sistemaConfigRepository.findAll()
            .stream()
            .findFirst()
            .orElseGet(() -> SistemaConfig.builder()
                .estado(EstadoSistema.LECTURA)
                .fechaHoraEstado(LocalDateTime.now())
                .build()
            );

        config.setEstado(nuevoEstado);
        config.setFechaHoraEstado(LocalDateTime.now());
        return sistemaConfigRepository.save(config);
    }
}
