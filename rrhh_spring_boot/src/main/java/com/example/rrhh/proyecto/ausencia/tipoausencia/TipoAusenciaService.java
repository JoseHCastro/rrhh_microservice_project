package com.example.rrhh.proyecto.ausencia.tipoausencia;

import com.example.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoAusenciaService {

    private final TipoAusenciaRepository tipoAusenciaRepository;

    @Transactional(readOnly = true)
    public List<TipoAusencia> findAll() {
        return tipoAusenciaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TipoAusencia findById(Long id) {
        return tipoAusenciaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TipoAusencia", id));
    }
}
