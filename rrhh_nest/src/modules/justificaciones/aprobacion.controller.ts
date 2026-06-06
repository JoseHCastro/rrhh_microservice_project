import { Body, Controller, Get, Header, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AccionToken } from '@prisma/client';
import { Public } from '../../auth/decorators/public.decorator';
import { AprobacionService, ResultadoValidacion } from './aprobacion.service';

/**
 * Aprobación/rechazo de justificaciones desde el correo del supervisor.
 *
 * SEGURIDAD (corrección clave): el enlace del correo abre una página de
 * confirmación por GET que NO muta nada (los pre-fetch de Gmail/Outlook no
 * disparan acciones). El cambio de estado ocurre SOLO en el POST que hace el
 * botón "Confirmar" de esa página, con un token de un solo uso.
 */
@Controller('api/v3/justificaciones')
export class AprobacionController {
  constructor(private readonly service: AprobacionService) {}

  // ── Página de confirmación (GET, read-only) ──────────────────
  @Public()
  @Get('confirmar')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async confirmar(@Query('token') token?: string): Promise<string> {
    if (!token) return pagina('Enlace inválido', '<p>Falta el token.</p>', false);
    const r = await this.service.validar(token);
    if (!r.ok) return pagina(...mensajeError(r.motivo));

    const accion = r.token.accion;
    const verbo = accion === AccionToken.APROBAR ? 'APROBAR' : 'RECHAZAR';
    const color = accion === AccionToken.APROBAR ? '#16a34a' : '#dc2626';
    const j = r.justificacion;

    const iaBloque = j.iaAnalizado
      ? `<div class="card ia">
           <div class="ia-tag">🤖 Sugerencia de IA (no es decisión — tú decides)</div>
           <p><strong>Recomendación:</strong> ${esc(j.recomendacionIa)} ·
              <strong>Confianza:</strong> ${j.confianzaIa != null ? Math.round(j.confianzaIa * 100) + '%' : '—'}</p>
           <p><strong>Resumen:</strong> ${esc(j.resumenIa)}</p>
           <p><strong>El documento declara:</strong> ${esc(j.diagnosticoIa)}</p>
           <p><strong>Días de reposo declarados:</strong> ${j.diasReposoIa ?? '—'} ·
              <strong>¿Doc. válido?:</strong> ${j.documentoValidoIa == null ? '—' : j.documentoValidoIa ? 'Sí' : 'No'}</p>
         </div>`
      : j.iaError
        ? `<div class="card warn">
             <div class="ia-tag" style="color:#b45309">⚠️ La IA no pudo analizar el adjunto</div>
             <p>${esc(j.iaError)}</p>
             <p class="hint">Revisa el documento manualmente antes de decidir.</p>
           </div>`
        : '';

    const adjuntoBloque = j.archivoId
      ? `<p style="margin-top:10px">
           <a href="${esc(this.service.urlAdjunto(token))}" target="_blank">📎 Ver documento adjunto</a>
           <span class="hint">(enlace temporal de 15 min)</span>
         </p>`
      : '<p class="hint" style="margin-top:10px">Sin documento adjunto.</p>';

    const body = `
      <h1>Confirmar: <span style="color:${color}">${verbo}</span></h1>
      <div class="card">
        <p><strong>Justificación #${j.id}</strong> · Empleado ID ${j.empleadoId}</p>
        <p><strong>Canal:</strong> ${esc(j.tipoCanal)} · <strong>Estado:</strong> ${esc(j.estado)}</p>
        <p><strong>Mensaje del empleado:</strong><br>${esc(j.mensajeOriginal) || '<em>(sin texto)</em>'}</p>
        ${adjuntoBloque}
      </div>
      ${iaBloque}
      <form method="POST" action="/api/v3/justificaciones/resolver" style="margin-top:18px">
        <input type="hidden" name="token" value="${esc(token)}" />
        <button type="submit" style="background:${color}">Confirmar ${verbo}</button>
        <p class="hint">Esta acción es definitiva y de un solo uso.</p>
      </form>`;
    return pagina(`Confirmar ${verbo.toLowerCase()}`, body, true);
  }

  // ── Ver el adjunto (GET, no muta): valida token y redirige a presigned S3 ──
  @Public()
  @Get('adjunto')
  async adjunto(
    @Res() res: Response,
    @Query('token') token?: string,
  ): Promise<void> {
    if (!token) {
      res.status(400).type('html').send(pagina('Error', '<div class="card"><p>Falta el token.</p></div>', false));
      return;
    }
    const r = await this.service.presignedAdjuntoPorToken(token);
    if (!r.ok) {
      const map: Record<string, string> = {
        NO_EXISTE: 'El enlace no es válido.',
        USADO: 'Este enlace ya fue utilizado.',
        EXPIRADO: 'El enlace expiró.',
        NO_PENDIENTE: 'La justificación ya fue resuelta.',
        SIN_ADJUNTO: 'Esta justificación no tiene documento adjunto.',
      };
      res
        .status(403)
        .type('html')
        .send(pagina('No disponible', `<div class="card"><p>${map[r.motivo] ?? r.motivo}</p></div>`, false));
      return;
    }
    // Redirección a la presigned URL de S3 (corta vida). El bucket NO es público.
    res.redirect(r.url);
  }

  // ── Acción real (POST, muta) ─────────────────────────────────
  @Public()
  @Post('resolver')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async resolver(@Body('token') token?: string): Promise<string> {
    if (!token) return pagina('Error', '<p>Falta el token.</p>', false);
    const r = await this.service.resolver(token);
    if (!r.ok) return pagina(...mensajeError(r.motivo));

    const aprobada = r.justificacion.estado === 'APROBADA';
    const icono = aprobada ? '✅' : '🚫';
    const txt = aprobada ? 'APROBADA' : 'RECHAZADA';
    const color = aprobada ? '#16a34a' : '#dc2626';
    return pagina(
      'Listo',
      `<h1 style="color:${color}">${icono} Justificación #${r.justificacion.id} ${txt}</h1>
       <div class="card"><p>La decisión quedó registrada. Ya puedes cerrar esta pestaña.</p></div>`,
      true,
    );
  }
}

// ── Helpers de presentación ────────────────────────────────────
function esc(v: unknown): string {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mensajeError(
  motivo: Exclude<ResultadoValidacion, { ok: true }>['motivo'],
): [string, string, boolean] {
  const m: Record<string, string> = {
    NO_EXISTE: 'El enlace no es válido.',
    USADO: 'Este enlace ya fue utilizado.',
    EXPIRADO: 'El enlace expiró.',
    NO_PENDIENTE: 'La justificación ya fue resuelta.',
  };
  return ['No disponible', `<div class="card"><p>${m[motivo]}</p></div>`, false];
}

function pagina(titulo: string, contenido: string, _ok: boolean): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} · RRHH</title>
<style>
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f1f5f9;color:#1e293b;
       max-width:640px;margin:40px auto;padding:0 16px;line-height:1.6}
  h1{font-size:1.5rem}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:12px 0;
        box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .card.ia{border-color:#c7d2fe;background:#eef2ff}
  .card.warn{border-color:#fcd34d;background:#fffbeb}
  a{color:#4f46e5}
  .ia-tag{font-size:.8rem;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:.04em}
  button{border:0;color:#fff;font-size:1rem;font-weight:600;padding:12px 22px;border-radius:10px;cursor:pointer}
  .hint{color:#64748b;font-size:.85rem;margin-top:8px}
</style></head><body>${contenido}</body></html>`;
}
