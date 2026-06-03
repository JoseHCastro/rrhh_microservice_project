package com.example.rrhh.usuario.auth.dto;

import com.example.rrhh.usuario.rol.NombreRol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 50) String username,
    @NotBlank @Size(min = 8, max = 100) String password,
    Long empleadoId,    // Opcional: vincular a un empleado
    NombreRol rol       // Opcional: por defecto ROLE_EMPLEADO
) {}
