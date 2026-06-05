package com.example.rrhh.proyecto.empleado;

import com.example.rrhh.proyecto.cargo.Cargo;
import com.example.rrhh.proyecto.cargo.CargoRepository;
import com.example.rrhh.proyecto.departamento.Departamento;
import com.example.rrhh.proyecto.departamento.DepartamentoRepository;
import com.example.rrhh.proyecto.empleado.dto.EmpleadoInput;
import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final DepartamentoRepository departamentoRepository;
    private final CargoRepository cargoRepository;

    @Transactional(readOnly = true)
    public Page<Empleado> findAll(EstadoEmpleado estado, Long departamentoId, int page, int size) {
        return empleadoRepository.findAllWithFilters(
            estado, departamentoId, PageRequest.of(page, size)
        );
    }

    @Transactional(readOnly = true)
    public Empleado findById(Long id) {
        // Con JOIN FETCH para que departamento/cargo/supervisor estén disponibles
        // durante la serialización GraphQL (open-in-view=false).
        return empleadoRepository.findByIdWithRelations(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empleado", id));
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public Empleado crear(EmpleadoInput input) {
        if (input.carnetIdentidad() != null &&
            empleadoRepository.existsByCarnetIdentidad(input.carnetIdentidad())) {
            throw new BusinessException(
                "Ya existe un empleado con CI: " + input.carnetIdentidad()
            );
        }

        Departamento departamento = departamentoRepository.findById(input.departamentoId())
            .orElseThrow(() -> new ResourceNotFoundException("Departamento", input.departamentoId()));

        Cargo cargo = cargoRepository.findById(input.cargoId())
            .orElseThrow(() -> new ResourceNotFoundException("Cargo", input.cargoId()));

        Empleado supervisor = null;
        if (input.supervisorId() != null) {
            supervisor = empleadoRepository.findById(input.supervisorId())
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", input.supervisorId()));
        }

        Empleado empleado = Empleado.builder()
            .nombre(input.nombre())
            .apellido(input.apellido())
            .fechaContratacion(input.fechaContratacion())
            .departamento(departamento)
            .cargo(cargo)
            .supervisor(supervisor)
            .horaEntrada(input.horaEntrada())
            .horaSalida(input.horaSalida())
            .telefono(input.telefono())
            .carnetIdentidad(input.carnetIdentidad())
            .estado(EstadoEmpleado.ACTIVO)
            .build();

        Empleado saved = empleadoRepository.save(empleado);
        log.info("Empleado creado: {} {} [id={}]", saved.getNombre(), saved.getApellido(), saved.getId());
        return saved;
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public Empleado actualizar(Long id, EmpleadoInput input) {
        Empleado empleado = findById(id);

        Departamento departamento = departamentoRepository.findById(input.departamentoId())
            .orElseThrow(() -> new ResourceNotFoundException("Departamento", input.departamentoId()));

        Cargo cargo = cargoRepository.findById(input.cargoId())
            .orElseThrow(() -> new ResourceNotFoundException("Cargo", input.cargoId()));

        empleado.setNombre(input.nombre());
        empleado.setApellido(input.apellido());
        empleado.setFechaContratacion(input.fechaContratacion());
        empleado.setDepartamento(departamento);
        empleado.setCargo(cargo);
        empleado.setHoraEntrada(input.horaEntrada());
        empleado.setHoraSalida(input.horaSalida());
        empleado.setTelefono(input.telefono());

        return empleadoRepository.save(empleado);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public boolean desactivar(Long id) {
        Empleado empleado = findById(id);
        empleado.setEstado(EstadoEmpleado.INACTIVO);
        empleadoRepository.save(empleado);
        log.info("Empleado desactivado: [id={}]", id);
        return true;
    }
}
