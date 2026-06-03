package com.example.rrhh.proyecto.tokenpush;

import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.usuario.Usuario;
import com.example.rrhh.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenPushService {

    private final TokenPushRepository tokenPushRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public TokenPush registrar(String tokenFcm, String dispositivo) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsernameWithRoles(username)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        // Si el token ya existe, actualizarlo
        return tokenPushRepository.findByTokenFcm(tokenFcm)
            .map(t -> {
                t.setActivo(true);
                t.setDispositivo(dispositivo);
                return tokenPushRepository.save(t);
            })
            .orElseGet(() -> tokenPushRepository.save(
                TokenPush.builder()
                    .usuario(usuario)
                    .tokenFcm(tokenFcm)
                    .dispositivo(dispositivo)
                    .activo(true)
                    .build()
            ));
    }

    @Transactional
    public boolean revocar(String tokenFcm) {
        tokenPushRepository.findByTokenFcm(tokenFcm)
            .ifPresent(t -> {
                t.setActivo(false);
                tokenPushRepository.save(t);
            });
        return true;
    }
}
