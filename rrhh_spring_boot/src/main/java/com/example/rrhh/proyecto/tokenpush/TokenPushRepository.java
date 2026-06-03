package com.example.rrhh.proyecto.tokenpush;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenPushRepository extends JpaRepository<TokenPush, Long> {
    List<TokenPush> findByUsuarioIdAndActivoTrue(Long usuarioId);
    Optional<TokenPush> findByTokenFcm(String tokenFcm);
}
