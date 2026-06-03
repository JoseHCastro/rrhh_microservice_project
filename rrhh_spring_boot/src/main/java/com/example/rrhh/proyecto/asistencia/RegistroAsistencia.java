package com.example.rrhh.proyecto.asistencia;

import com.example.rrhh.proyecto.empleado.Empleado;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registro_asistencia", indexes = {
    @Index(name = "idx_ra_empleado_entrada", columnList = "empleado_id, hora_entrada")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class RegistroAsistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "empleado_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ra_empleado")
    )
    private Empleado empleado;

    @Column(name = "hora_entrada", nullable = false)
    private LocalDateTime horaEntrada;

    // NULL si el empleado no marcó salida (CRON lo detecta al cierre del día)
    @Column(name = "hora_salida")
    private LocalDateTime horaSalida;

    // Coordenadas GPS (formato: "latitud,longitud")
    @Column(name = "ubicacion_gps", columnDefinition = "varchar(50)")
    private String ubicacionGps;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EstadoAsistencia estado = EstadoAsistencia.REGISTRADO;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_planilla", nullable = false, length = 20)
    @Builder.Default
    private EstadoPlanilla estadoPlanilla = EstadoPlanilla.NORMAL;
}
