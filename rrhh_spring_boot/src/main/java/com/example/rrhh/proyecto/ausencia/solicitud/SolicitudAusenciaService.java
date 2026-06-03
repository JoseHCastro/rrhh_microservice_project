package com.example.rrhh.proyecto.ausencia.solicitud;

import com.example.rrhh.proyecto.ausencia.solicitud.evento.SolicitudAusenciaAprobadaEvent;
import com.example.rrhh.proyecto.ausencia.solicitud.evento.SolicitudAusenciaRechazadaEvent;
import com.example.rrhh.proyecto.ausencia.tipoausencia.TipoAusencia;
import com.example.rrhh.proyecto.ausencia.tipoausencia.TipoAusenciaRepository;
import com.example.rrhh.proyecto.empleado.Empleado;
import com.example.rrhh.proyecto.empleado.EmpleadoRepository;
import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.shared.exception.ResourceNotFoundException;
import com.example.rrhh.usuario.Usuario;
import com.example.rrhh.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudAusenciaService {

    private final SolicitudAusenciaRepository solicitudRepository;
    private final EmpleadoRepository empleadoRepository;
    private final TipoAusenciaRepository tipoAusenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ApplicationEventPublisher eventPublisher;  // ← Desacoplamiento

    @Transactional
    public SolicitudAusencia crear(
        Long empleadoId, Long tipoAusenciaId, LocalDate inicio, LocalDate fin
    ) {
        if (fin.isBefore(inicio)) {
            throw new BusinessException("La fecha fin debe ser posterior a la fecha inicio");
        }

        Empleado empleado = empleadoRepository.findById(empleadoId)
            .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));

        TipoAusencia tipoAusencia = tipoAusenciaRepository.findById(tipoAusenciaId)
            .orElseThrow(() -> new ResourceNotFoundException("TipoAusencia", tipoAusenciaId));

        boolean hayConflicto = solicitudRepository.existeConflictoFechas(empleadoId, inicio, fin);
        if (hayConflicto) {
            throw new BusinessException(
                "Ya existe una solicitud de ausencia en ese rango de fechas"
            );
        }

        SolicitudAusencia solicitud = SolicitudAusencia.builder()
            .empleado(empleado)
            .tipoAusencia(tipoAusencia)
            .fechaInicio(inicio)
            .fechaFin(fin)
            .estado(EstadoSolicitud.PENDIENTE)
            .build();

        return solicitudRepository.save(solicitud);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH', 'SUPERVISOR')")
    public SolicitudAusencia aprobar(Long solicitudId) {
        SolicitudAusencia solicitud = findById(solicitudId);
        validarEstadoPendiente(solicitud);

        Usuario aprobador = getUsuarioAutenticado();
        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setAprobador(aprobador);

        SolicitudAusencia saved = solicitudRepository.save(solicitud);

        // Publicar evento → FcmService lo escucha y envía push notification
        eventPublisher.publishEvent(new SolicitudAusenciaAprobadaEvent(this, saved));
        log.info("Solicitud {} aprobada por {}", solicitudId, aprobador.getUsername());
        return saved;
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'RRHH', 'SUPERVISOR')")
    public SolicitudAusencia rechazar(Long solicitudId) {
        SolicitudAusencia solicitud = findById(solicitudId);
        validarEstadoPendiente(solicitud);

        Usuario aprobador = getUsuarioAutenticado();
        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setAprobador(aprobador);

        SolicitudAusencia saved = solicitudRepository.save(solicitud);
        eventPublisher.publishEvent(new SolicitudAusenciaRechazadaEvent(this, saved));
        return saved;
    }

    @Transactional(readOnly = true)
    public List<SolicitudAusencia> findAll(EstadoSolicitud estado, Long empleadoId) {
        return solicitudRepository.findAllWithFilters(estado, empleadoId);
    }

    // ── Helpers ──────────────────────────────────────────────────
    private SolicitudAusencia findById(Long id) {
        return solicitudRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SolicitudAusencia", id));
    }

    private void validarEstadoPendiente(SolicitudAusencia solicitud) {
        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException(
                "La solicitud ya fue procesada con estado: " + solicitud.getEstado()
            );
        }
    }

    private Usuario getUsuarioAutenticado() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        return usuarioRepository.findByUsernameWithRoles(username)
            .orElseThrow(() -> new BusinessException("Usuario autenticado no encontrado"));
    }
}
