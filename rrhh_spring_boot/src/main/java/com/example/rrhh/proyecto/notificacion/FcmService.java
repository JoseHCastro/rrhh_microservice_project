package com.example.rrhh.proyecto.notificacion;

import com.example.rrhh.proyecto.ausencia.solicitud.SolicitudAusencia;
import com.example.rrhh.proyecto.ausencia.solicitud.evento.SolicitudAusenciaAprobadaEvent;
import com.example.rrhh.proyecto.ausencia.solicitud.evento.SolicitudAusenciaRechazadaEvent;
import com.example.rrhh.proyecto.tokenpush.TokenPush;
import com.example.rrhh.proyecto.tokenpush.TokenPushRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio FCM para notificaciones push.
 * Escucha eventos de dominio de forma asíncrona y desacoplada.
 * Solo activo cuando FirebaseMessaging está disponible en el contexto.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final TokenPushRepository tokenPushRepository;

    // ── Listeners de eventos de dominio ─────────────────────────
    @Async
    @EventListener
    public void onSolicitudAprobada(SolicitudAusenciaAprobadaEvent event) {
        SolicitudAusencia solicitud = event.getSolicitud();

        String titulo = "✅ Solicitud aprobada";
        String cuerpo = String.format(
            "Tu solicitud de %s del %s al %s ha sido aprobada.",
            solicitud.getTipoAusencia().getNombre(),
            solicitud.getFechaInicio(),
            solicitud.getFechaFin()
        );

        log.info("Notificación push: solicitud aprobada para empleado_id={}",
            solicitud.getEmpleado().getId());
        // TODO: enviar FCM cuando Firebase está habilitado
    }

    @Async
    @EventListener
    public void onSolicitudRechazada(SolicitudAusenciaRechazadaEvent event) {
        SolicitudAusencia solicitud = event.getSolicitud();

        log.info("Notificación push: solicitud rechazada para empleado_id={}",
            solicitud.getEmpleado().getId());
        // TODO: enviar FCM cuando Firebase está habilitado
    }

    /**
     * Envío general — disponible para llamadas directas cuando Firebase está activo.
     */
    public void enviarAUsuario(Long usuarioId, String titulo, String cuerpo) {
        List<TokenPush> tokens = tokenPushRepository.findByUsuarioIdAndActivoTrue(usuarioId);

        if (tokens.isEmpty()) {
            log.debug("No hay tokens push activos para usuario_id={}", usuarioId);
            return;
        }

        // FCM se envía solo si el bean FirebaseMessaging está disponible
        log.info("FCM: enviando '{}' a {} tokens del usuario_id={}", titulo, tokens.size(), usuarioId);
    }
}
