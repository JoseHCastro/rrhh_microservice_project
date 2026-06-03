package com.example.rrhh.proyecto.ausencia.tipoausencia;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipos_ausencia")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TipoAusencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;
}
