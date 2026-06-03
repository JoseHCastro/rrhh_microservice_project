package com.example.rrhh.proyecto.reconocimientofacial;

import com.example.rrhh.proyecto.empleado.Empleado;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reconocimiento_facial")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReconocimientoFacial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "empleado_id",
        unique = true,
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_rf_empleado")
    )
    private Empleado empleado;

    // Hash/código devuelto por el hardware de reconocimiento facial
    @Column(name = "codigo_facial", nullable = false, unique = true, length = 255)
    private String codigoFacial;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;
}
