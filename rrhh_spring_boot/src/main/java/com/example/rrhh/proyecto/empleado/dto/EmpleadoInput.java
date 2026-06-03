package com.example.rrhh.proyecto.empleado.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record EmpleadoInput(
    @NotBlank String nombre,
    @NotBlank String apellido,
    @NotNull  LocalDate fechaContratacion,
    @NotNull  Long departamentoId,
    @NotNull  Long cargoId,
    Long supervisorId,           // Nullable
    @NotNull  LocalTime horaEntrada,
    @NotNull  LocalTime horaSalida,
    String telefono,
    String carnetIdentidad
) {}
