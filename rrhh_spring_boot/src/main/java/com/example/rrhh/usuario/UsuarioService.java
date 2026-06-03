package com.example.rrhh.usuario;

import com.example.rrhh.shared.exception.ResourceNotFoundException;
import com.example.rrhh.usuario.rol.NombreRol;
import com.example.rrhh.usuario.rol.Rol;
import com.example.rrhh.usuario.rol.RolRepository;
import com.example.rrhh.usuario.usuariorol.UsuarioRol;
import com.example.rrhh.usuario.usuariorol.UsuarioRolId;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    // ── UserDetailsService (requerido por Spring Security) ──────
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByUsernameWithRoles(username)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Usuario no encontrado: " + username
            ));
    }

    // ── Queries ─────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }

    // ── Mutations ────────────────────────────────────────────────
    @Transactional
    public Usuario activar(Long id) {
        Usuario usuario = findById(id);
        usuario.setActivo(true);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public boolean desactivar(Long id) {
        Usuario usuario = findById(id);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
        return true;
    }

    @Transactional
    public Usuario asignarRol(Long usuarioId, NombreRol nombreRol) {
        Usuario usuario = findById(usuarioId);
        Rol rol = rolRepository.findByNombre(nombreRol)
            .orElseThrow(() -> new ResourceNotFoundException("Rol: " + nombreRol));

        UsuarioRolId urId = new UsuarioRolId(usuarioId, rol.getId());
        boolean yaExiste = usuario.getRoles().stream()
            .anyMatch(ur -> ur.getId().equals(urId));

        if (!yaExiste) {
            UsuarioRol ur = UsuarioRol.builder()
                .id(urId)
                .usuario(usuario)
                .rol(rol)
                .build();
            usuario.getRoles().add(ur);
            usuarioRepository.save(usuario);
        }
        return usuario;
    }
}
