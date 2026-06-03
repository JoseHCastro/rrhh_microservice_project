package com.example.rrhh.usuario.auth;

import com.example.rrhh.config.security.JwtService;
import com.example.rrhh.proyecto.empleado.Empleado;
import com.example.rrhh.proyecto.empleado.EmpleadoRepository;
import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.shared.exception.ResourceNotFoundException;
import com.example.rrhh.usuario.Usuario;
import com.example.rrhh.usuario.UsuarioRepository;
import com.example.rrhh.usuario.auth.dto.AuthResponse;
import com.example.rrhh.usuario.auth.dto.LoginRequest;
import com.example.rrhh.usuario.auth.dto.RegisterRequest;
import com.example.rrhh.usuario.rol.NombreRol;
import com.example.rrhh.usuario.rol.Rol;
import com.example.rrhh.usuario.rol.RolRepository;
import com.example.rrhh.usuario.usuariorol.UsuarioRol;
import com.example.rrhh.usuario.usuariorol.UsuarioRolId;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final com.example.rrhh.config.properties.JwtProperties jwtProperties;

    // ── LOGIN ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        Usuario usuario = usuarioRepository.findByUsernameWithRoles(request.username())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + request.username()));

        return buildAuthResponse(usuario);
    }

    // ── REGISTER ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByUsername(request.username())) {
            throw new BusinessException("El username '" + request.username() + "' ya está en uso");
        }

        Empleado empleado = null;
        if (request.empleadoId() != null) {
            empleado = empleadoRepository.findById(request.empleadoId())
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", request.empleadoId()));

            if (usuarioRepository.findByEmpleadoId(request.empleadoId()).isPresent()) {
                throw new BusinessException("El empleado ya tiene usuario asignado");
            }
        }

        NombreRol rolNombre = request.rol() != null ? request.rol() : NombreRol.ROLE_EMPLEADO;
        Rol rol = rolRepository.findByNombre(rolNombre)
            .orElseThrow(() -> new ResourceNotFoundException("Rol: " + rolNombre));

        Usuario usuario = Usuario.builder()
            .username(request.username())
            .password(passwordEncoder.encode(request.password()))
            .empleado(empleado)
            .activo(true)
            .build();

        UsuarioRol usuarioRol = UsuarioRol.builder()
            .usuario(usuario)
            .rol(rol)
            .build();
        usuario.getRoles().add(usuarioRol);

        usuarioRepository.save(usuario);
        return buildAuthResponse(usuario);
    }

    // ── REFRESH TOKEN ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        Usuario usuario = usuarioRepository.findByUsernameWithRoles(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        if (!jwtService.isTokenValid(refreshToken, usuario)) {
            throw new BusinessException("Refresh token inválido o expirado");
        }

        return buildAuthResponse(usuario);
    }

    // ── Helper ───────────────────────────────────────────────────
    private AuthResponse buildAuthResponse(Usuario usuario) {
        String accessToken  = jwtService.generateAccessToken(usuario);
        String refreshToken = jwtService.generateRefreshToken(usuario);

        List<String> roles = usuario.getAuthorities().stream()
            .map(auth -> auth.getAuthority())
            .toList();

        return new AuthResponse(
            accessToken,
            refreshToken,
            jwtProperties.expirationMs() / 1000,
            usuario.getUsername(),
            roles
        );
    }
}
