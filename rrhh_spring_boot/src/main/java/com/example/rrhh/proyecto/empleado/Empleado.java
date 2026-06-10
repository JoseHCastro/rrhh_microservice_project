package com.example.rrhh.proyecto.empleado;

import com.example.rrhh.proyecto.cargo.Cargo;
import com.example.rrhh.proyecto.departamento.Departamento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "empleados")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(name = "fecha_contratacion", nullable = false)
    private LocalDate fechaContratacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoEmpleado estado = EstadoEmpleado.ACTIVO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "departamento_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_empleado_departamento")
    )
    private Departamento departamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "cargo_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_empleado_cargo")
    )
    private Cargo cargo;

    // Auto-referencial: un empleado puede tener supervisor (otro empleado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "supervisor_id",
        nullable = true,
        foreignKey = @ForeignKey(name = "fk_empleado_supervisor")
    )
    private Empleado supervisor;

    @Column(name = "hora_entrada", nullable = false)
    private LocalTime horaEntrada;

    @Column(name = "hora_salida", nullable = false)
    private LocalTime horaSalida;

    @Column(length = 20)
    private String telefono;

    @Column(name = "carnet_identidad", unique = true, length = 20)
    private String carnetIdentidad;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(length = 20)
    private String genero;

    @Column(name = "ubicacion_hogar_gps", length = 50)
    private String ubicacionHogarGps;
}
