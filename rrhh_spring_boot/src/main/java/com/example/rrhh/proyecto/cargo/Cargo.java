package com.example.rrhh.proyecto.cargo;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cargos")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "salario_por_hora", nullable = false, precision = 10, scale = 2)
    private BigDecimal salarioPorHora;
}
