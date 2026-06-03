package com.example.rrhh.proyecto.departamento;

import com.example.rrhh.proyecto.empleado.Empleado;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departamentos")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    // FK al empleado que es gerente (nullable: puede no tener gerente asignado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "gerente_id",
        nullable = true,
        foreignKey = @ForeignKey(name = "fk_departamento_gerente")
    )
    private Empleado gerente;
}
