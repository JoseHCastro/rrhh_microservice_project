package com.example.rrhh.proyecto.empleado;

import com.example.rrhh.proyecto.empleado.dto.EmpleadoInput;
import com.example.rrhh.usuario.Usuario;
import com.example.rrhh.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class EmpleadoResolver {

    private final EmpleadoService empleadoService;
    private final UsuarioRepository usuarioRepository;

    // ── Queries ─────────────────────────────────────────────────
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> empleados(
        @Argument Integer page,
        @Argument Integer size,
        @Argument EstadoEmpleado estado,
        @Argument Long departamentoId
    ) {
        Page<Empleado> pageResult = empleadoService.findAll(
            estado, departamentoId,
            page != null ? page : 0,
            size != null ? size : 20
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

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Empleado empleado(@Argument Long id) {
        return empleadoService.findById(id);
    }

    // ── Mutations ────────────────────────────────────────────────
    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public Empleado crearEmpleado(@Argument EmpleadoInput input) {
        return empleadoService.crear(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH')")
    public Empleado actualizarEmpleado(@Argument Long id, @Argument EmpleadoInput input) {
        return empleadoService.actualizar(id, input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean desactivarEmpleado(@Argument Long id) {
        return empleadoService.desactivar(id);
    }

    // ── Field Resolvers (@BatchMapping evita N+1) ────────────────
    /**
     * Carga todos los usuarios de todos los empleados en UNA sola query.
     */
    @BatchMapping(typeName = "Empleado", field = "usuario")
    public Map<Empleado, Usuario> usuarios(List<Empleado> empleados) {
        List<Long> ids = empleados.stream().map(Empleado::getId).toList();

        Map<Long, Usuario> usuarioByEmpleadoId = usuarioRepository
            .findByEmpleadoIdIn(ids)
            .stream()
            .collect(java.util.stream.Collectors.toMap(
                u -> u.getEmpleado().getId(),
                u -> u
            ));

        return empleados.stream()
            .collect(java.util.stream.Collectors.toMap(
                e -> e,
                e -> usuarioByEmpleadoId.get(e.getId()),
                (a, b) -> a
            ));
    }

    // Campo calculado: nombreCompleto
    @SchemaMapping(typeName = "Empleado", field = "nombreCompleto")
    public String nombreCompleto(Empleado empleado) {
        return empleado.getNombre() + " " + empleado.getApellido();
    }
}
