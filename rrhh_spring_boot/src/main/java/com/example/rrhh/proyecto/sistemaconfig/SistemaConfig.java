package com.example.rrhh.proyecto.sistemaconfig;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sistema_config")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class SistemaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSistema estado;

    @Column(name = "fecha_hora_estado", nullable = false)
    private LocalDateTime fechaHoraEstado;
}
