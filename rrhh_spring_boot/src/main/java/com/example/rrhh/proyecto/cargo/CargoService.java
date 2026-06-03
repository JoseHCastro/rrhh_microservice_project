package com.example.rrhh.proyecto.cargo;

import com.example.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CargoService {

    private final CargoRepository cargoRepository;

    @Transactional(readOnly = true)
    public List<Cargo> findAll() {
        return cargoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Cargo findById(Long id) {
        return cargoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cargo", id));
    }
}
