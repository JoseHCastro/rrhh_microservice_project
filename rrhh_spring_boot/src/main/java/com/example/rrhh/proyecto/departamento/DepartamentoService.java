package com.example.rrhh.proyecto.departamento;

import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartamentoService {

    private final DepartamentoRepository departamentoRepository;

    @Transactional(readOnly = true)
    public List<Departamento> findAll() {
        return departamentoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Departamento findById(Long id) {
        return departamentoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Departamento", id));
    }

    @Transactional
    public Departamento crear(String nombre) {
        if (departamentoRepository.existsByNombre(nombre)) {
            throw new BusinessException("Ya existe un departamento con nombre: " + nombre);
        }
        return departamentoRepository.save(Departamento.builder().nombre(nombre).build());
    }
}
