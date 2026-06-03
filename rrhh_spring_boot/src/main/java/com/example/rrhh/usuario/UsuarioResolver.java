package com.example.rrhh.usuario;

import com.example.rrhh.usuario.rol.NombreRol;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class UsuarioResolver {

    private final UsuarioService usuarioService;

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Usuario> usuarios() {
        return usuarioService.findAll();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Usuario usuario(@Argument Long id) {
        return usuarioService.findById(id);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean activarUsuario(@Argument Long id) {
        usuarioService.activar(id);
        return true;
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean desactivarUsuario(@Argument Long id) {
        return usuarioService.desactivar(id);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Usuario asignarRol(@Argument Long usuarioId, @Argument NombreRol rol) {
        return usuarioService.asignarRol(usuarioId, rol);
    }
}
