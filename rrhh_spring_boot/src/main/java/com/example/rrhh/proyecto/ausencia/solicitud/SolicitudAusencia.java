package com.example.rrhh.proyecto.ausencia.solicitud;

import com.example.rrhh.proyecto.ausencia.tipoausencia.TipoAusencia;
import com.example.rrhh.proyecto.empleado.Empleado;
import com.example.rrhh.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_ausencia")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class SolicitudAusencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "empleado_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_sa_empleado")
    )
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "tipo_ausencia_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_sa_tipo_ausencia")
    )
    private TipoAusencia tipoAusencia;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @CreatedDate
    @Column(name = "fecha_solicitud", updatable = false)
    private LocalDateTime fechaSolicitud;

    // El usuario que aprobó/rechazó la solicitud (null mientras PENDIENTE)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "aprobador_id",
        nullable = true,
        foreignKey = @ForeignKey(name = "fk_sa_aprobador")
    )
    private Usuario aprobador;
}
