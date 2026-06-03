package com.example.rrhh.proyecto.ausencia.solicitud.evento;

import com.example.rrhh.proyecto.ausencia.solicitud.SolicitudAusencia;
import org.springframework.context.ApplicationEvent;

public class SolicitudAusenciaAprobadaEvent extends ApplicationEvent {

    private final SolicitudAusencia solicitud;

    public SolicitudAusenciaAprobadaEvent(Object source, SolicitudAusencia solicitud) {
        super(source);
        this.solicitud = solicitud;
    }

    public SolicitudAusencia getSolicitud() { return solicitud; }
}
