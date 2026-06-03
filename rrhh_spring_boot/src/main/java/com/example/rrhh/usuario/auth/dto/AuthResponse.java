package com.example.rrhh.usuario.auth.dto;

import java.util.List;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    long expiresIn,
    String username,
    List<String> roles
) {}
