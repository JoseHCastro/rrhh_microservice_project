package com.example.rrhh.config;

import com.example.rrhh.usuario.Usuario;
import com.example.rrhh.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminPasswordFixer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String newHash = passwordEncoder.encode("password123");
        usuarioRepository.findAll().forEach(usuario -> {
            usuario.setPassword(newHash);
            usuarioRepository.save(usuario);
        });
        log.info("FIX: All users' passwords have been forcefully reset to 'password123'");
    }
}
