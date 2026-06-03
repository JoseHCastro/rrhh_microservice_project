package com.example.rrhh.proyecto.preplanilla;

import com.example.rrhh.proyecto.empleado.Empleado;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "preplanillas", indexes = {
    @Index(name = "idx_preplanilla_empleado_periodo", columnList = "empleado_id, periodo")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Preplanilla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "empleado_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_preplanilla_empleado")
    )
    private Empleado empleado;

    // Ej: "2025-04"
    @Column(nullable = false, length = 7)
    private String periodo;

    // URI al objeto en S3
    @Column(name = "s3_key_uri", length = 500)
    private String s3KeyUri;

    @Column(name = "dias_trabajados")
    @Builder.Default
    private Integer diasTrabajados = 0;

    @Builder.Default
    private Integer faltas = 0;

    @Builder.Default
    private Integer retrasos = 0;

    @Column(name = "permisos_aprobados")
    @Builder.Default
    private Integer permisosAprobados = 0;

    @Builder.Default
    private Integer licencias = 0;

    @Column(name = "horas_extra", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal horasExtra = BigDecimal.ZERO;

    @Column(name = "marcaciones_observadas")
    @Builder.Default
    private Integer marcacionesObservadas = 0;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    // Hash SHA-256 del PDF para integridad
    @Column(name = "documento_hash", length = 64)
    private String documentoHash;

    // Referencia a transacción blockchain (futuro)
    @Column(name = "blockchain_tx", length = 100)
    private String blockchainTx;
}
