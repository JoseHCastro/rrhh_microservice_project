package com.example.rrhh.proyecto.reconocimientofacial;

import com.example.rrhh.proyecto.empleado.Empleado;
import com.example.rrhh.proyecto.empleado.EmpleadoRepository;
import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReconocimientoFacialService {

    private final ReconocimientoFacialRepository rfRepository;
    private final EmpleadoRepository empleadoRepository;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public ReconocimientoFacial enrolar(Long empleadoId, String codigoFacial) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
            .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));

        if (rfRepository.existsByEmpleadoId(empleadoId)) {
            throw new BusinessException("El empleado ya tiene reconocimiento facial registrado");
        }

        return rfRepository.save(ReconocimientoFacial.builder()
            .empleado(empleado)
            .codigoFacial(codigoFacial)
            .fechaRegistro(LocalDateTime.now())
            .build());
    }
}
