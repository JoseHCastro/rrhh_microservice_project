import { Component } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import {
  ReporteInterpretacion,
  ReporteResultado,
  ReportesService,
} from '../services/reportes.service';

type GraficoData = { titulo: string; items: { label: string; valor: number; pct: number }[] };

const REPORTES = [
  { tipo: 'EMPLEADOS_POR_DEPARTAMENTO', label: 'Empleados por departamento' },
  { tipo: 'ASISTENCIA_POR_PERIODO', label: 'Asistencia por período' },
  { tipo: 'JUSTIFICACIONES_POR_ESTADO', label: 'Justificaciones por estado' },
  { tipo: 'ACCESOS_ARCHIVOS', label: 'Accesos a archivos (bitácora)' },
];

@Component({
  selector: 'app-reportes',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Reportes con IA</b></div>
          <h1>Reportes con IA</h1>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px">
            Escribe en lenguaje natural; la IA elige el reporte y sus parámetros, tú confirmas y
            se genera. Solo administradores.
          </div>
        </div>
      </div>

      <!-- 1) PROMPT + INTERPRETACIÓN -->
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div class="ff" style="margin:0">
          <label>Pídelo en lenguaje natural</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
            <input
              [(ngModel)]="prompt"
              (keyup.enter)="interpretar()"
              placeholder="Ej: justificaciones pendientes de abril · empleados de comercial · accesos al archivo 5"
              style="flex:1;min-width:280px"
            />
            <button class="btn" (click)="interpretar()" [disabled]="loadingInterpretar || !prompt.trim()">
              <app-icon name="search" [size]="15"></app-icon>
              {{ loadingInterpretar ? 'Interpretando…' : 'Interpretar' }}
            </button>
          </div>
        </div>

        <!-- Confirmación de lo que entendió la IA -->
        <div *ngIf="interpretacion && !loadingInterpretar" style="margin-top:14px">
          <div *ngIf="interpretacion.reporte" class="card" style="padding:12px;background:var(--bg2,#0000000a)">
            <div style="display:flex;align-items:flex-start;gap:10px">
              <div class="esic ca"><app-icon name="checkCircle" [size]="18"></app-icon></div>
              <div style="flex:1">
                <div style="font-size:13px">{{ interpretacion.explicacion }}</div>
                <div class="mt" style="font-size:11.5px;margin-top:4px">
                  {{ paramsLegibles(interpretacion.parametros) }}
                </div>
              </div>
              <button class="btn" (click)="confirmarYGenerar()" [disabled]="loadingEjecutar">
                <app-icon name="check" [size]="15"></app-icon> Generar
              </button>
            </div>
          </div>
          <div *ngIf="!interpretacion.reporte" class="es">
            <div class="esic cr2"><app-icon name="alert" [size]="20"></app-icon></div>
            <h4>No se pudo interpretar</h4><p>{{ interpretacion.explicacion }}</p>
          </div>
        </div>

        <!-- Alternativa manual (la capa de reportes funciona sin IA) -->
        <div style="margin-top:14px;border-top:1px solid var(--bd,#0001);padding-top:12px">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
            <div class="ff" style="margin:0">
              <label>…o elige el reporte manualmente</label>
              <select [(ngModel)]="tipoManual" (ngModelChange)="onTipoManualChange()" style="min-width:240px">
                <option *ngFor="let r of reportes" [value]="r.tipo">{{ r.label }}</option>
              </select>
            </div>

            <!-- EMPLEADOS_POR_DEPARTAMENTO -->
            <div class="ff" style="margin:0" *ngIf="tipoManual === 'EMPLEADOS_POR_DEPARTAMENTO'">
              <label>Departamento <span class="mt">(opcional)</span></label>
              <input [(ngModel)]="manual.departamentoNombre" placeholder="Ej: comercial" style="min-width:180px" />
            </div>

            <!-- ASISTENCIA_POR_PERIODO -->
            <ng-container *ngIf="tipoManual === 'ASISTENCIA_POR_PERIODO'">
              <div class="ff" style="margin:0">
                <label>Desde</label>
                <input type="date" [(ngModel)]="manual.desde" />
              </div>
              <div class="ff" style="margin:0">
                <label>Hasta</label>
                <input type="date" [(ngModel)]="manual.hasta" />
              </div>
              <div class="ff" style="margin:0">
                <label>Empleado (ID) <span class="mt">(opcional)</span></label>
                <input type="number" min="1" [(ngModel)]="manual.empleadoId" style="width:140px" />
              </div>
            </ng-container>

            <!-- JUSTIFICACIONES_POR_ESTADO -->
            <ng-container *ngIf="tipoManual === 'JUSTIFICACIONES_POR_ESTADO'">
              <div class="ff" style="margin:0">
                <label>Estado <span class="mt">(opcional)</span></label>
                <select [(ngModel)]="manual.estado" style="min-width:160px">
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="APROBADA">Aprobada</option>
                  <option value="RECHAZADA">Rechazada</option>
                </select>
              </div>
              <div class="ff" style="margin:0">
                <label>Desde <span class="mt">(opcional)</span></label>
                <input type="date" [(ngModel)]="manual.desde" />
              </div>
              <div class="ff" style="margin:0">
                <label>Hasta <span class="mt">(opcional)</span></label>
                <input type="date" [(ngModel)]="manual.hasta" />
              </div>
            </ng-container>

            <!-- ACCESOS_ARCHIVOS (requiere usuarioId O archivoId) -->
            <ng-container *ngIf="tipoManual === 'ACCESOS_ARCHIVOS'">
              <div class="ff" style="margin:0">
                <label>Usuario (ID)</label>
                <input type="number" min="1" [(ngModel)]="manual.usuarioId" style="width:140px" />
              </div>
              <div class="ff" style="margin:0">
                <label>Archivo (ID)</label>
                <input type="number" min="1" [(ngModel)]="manual.archivoId" style="width:140px" />
              </div>
              <div class="ff" style="margin:0">
                <label>Desde <span class="mt">(opcional)</span></label>
                <input type="date" [(ngModel)]="manual.desde" />
              </div>
              <div class="ff" style="margin:0">
                <label>Hasta <span class="mt">(opcional)</span></label>
                <input type="date" [(ngModel)]="manual.hasta" />
              </div>
            </ng-container>

            <button class="ab vw" (click)="generarManual()" [disabled]="loadingEjecutar || !manualValido()">
              <app-icon name="list" [size]="13"></app-icon> Generar directo
            </button>
          </div>

          <div class="mt" *ngIf="tipoManual === 'ACCESOS_ARCHIVOS' && !manualValido()" style="font-size:11.5px;margin-top:6px">
            Para «Accesos a archivos» indica al menos Usuario (ID) o Archivo (ID).
          </div>
        </div>
      </div>

      <!-- 2) RESULTADO -->
      <div class="card" *ngIf="loadingEjecutar || resultado || errorEjecutar">
        <div class="loadc" *ngIf="loadingEjecutar"><div class="spin"></div></div>

        <div class="es" *ngIf="errorEjecutar && !loadingEjecutar">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>{{ errorEjecutar }}</h4>
        </div>

        <div *ngIf="resultado && !loadingEjecutar">
          <!-- cabecera + exportar -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;flex-wrap:wrap;gap:8px">
            <div style="font-size:12.5px;color:var(--tx3)">
              <b style="color:var(--tx1)">{{ labelDe(resultado.reporte) }}</b>
              · {{ resultado.filas.length }} fila(s) · {{ resultado.generadoEn | date: 'dd MMM y, HH:mm' }}
            </div>
            <div style="display:flex;gap:6px">
              <button class="ab" (click)="exportCsv()" [disabled]="!resultado.filas.length">
                <app-icon name="download" [size]="13"></app-icon> CSV
              </button>
              <button class="ab" (click)="exportPdf()" [disabled]="!resultado.filas.length">
                <app-icon name="fileText" [size]="13"></app-icon> PDF
              </button>
            </div>
          </div>

          <!-- resumen IA (no bloqueante) -->
          <div style="padding:0 14px 10px">
            <div class="card" style="padding:11px 13px;background:var(--bg2,#0000000a);font-size:12.5px">
              <div style="display:flex;gap:8px;align-items:center">
                <app-icon name="chart" [size]="15"></app-icon><b>Resumen IA</b>
                <span class="mt" *ngIf="loadingResumen" style="font-size:11px">generando…</span>
              </div>
              <div style="margin-top:6px;line-height:1.5" *ngIf="resumen">{{ resumen }}</div>
              <div class="mt" *ngIf="!resumen && !loadingResumen" style="font-size:11.5px">—</div>
            </div>
          </div>

          <!-- gráfico (barras CSS) -->
          <div *ngIf="grafico as g" style="padding:0 14px 12px">
            <div style="font-size:11.5px;color:var(--tx3);margin-bottom:6px">{{ g.titulo }}</div>
            <div *ngFor="let it of g.items" style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
              <div style="width:160px;font-size:12px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ it.label }}</div>
              <div style="flex:1;background:var(--bd,#0001);border-radius:5px;height:16px;overflow:hidden">
                <div [style.width.%]="it.pct" style="height:100%;background:var(--brand,#4f46e5);border-radius:5px"></div>
              </div>
              <div style="width:34px;font-size:12px;font-weight:600">{{ it.valor }}</div>
            </div>
          </div>

          <!-- tabla -->
          <div class="tw">
            <table>
              <thead><tr><th *ngFor="let c of resultado.columnas">{{ c }}</th></tr></thead>
              <tbody>
                <tr *ngFor="let f of resultado.filas">
                  <td *ngFor="let v of valores(f)" class="mn">{{ v }}</td>
                </tr>
                <tr *ngIf="resultado.filas.length === 0">
                  <td [attr.colspan]="resultado.columnas.length">
                    <div class="es"><h4>Sin registros</h4><p>El reporte no devolvió filas para esos parámetros.</p></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReportesComponent {
  readonly reportes = REPORTES;

  prompt = '';
  tipoManual = REPORTES[0].tipo;

  /** Valores del modo manual; solo se usan los campos del reporte elegido. */
  manual: {
    departamentoNombre?: string;
    desde?: string;
    hasta?: string;
    empleadoId?: number | string;
    estado?: string;
    usuarioId?: number | string;
    archivoId?: number | string;
  } = {};

  interpretacion: ReporteInterpretacion | null = null;
  resultado: ReporteResultado | null = null;
  resumen = '';

  loadingInterpretar = false;
  loadingEjecutar = false;
  loadingResumen = false;
  errorEjecutar = '';

  constructor(private service: ReportesService, private toast: ToastService) {}

  // ── Capa 2: interpretar ──
  interpretar(): void {
    if (!this.prompt.trim()) return;
    this.loadingInterpretar = true;
    this.interpretacion = null;
    this.service.interpretar(this.prompt.trim()).subscribe({
      next: (i) => {
        this.interpretacion = i;
        this.loadingInterpretar = false;
      },
      error: (e) => {
        this.loadingInterpretar = false;
        this.toast.error('No se pudo interpretar', this.msg(e));
      },
    });
  }

  confirmarYGenerar(): void {
    if (!this.interpretacion?.reporte) return;
    this.ejecutar(this.interpretacion.reporte, this.interpretacion.parametros ?? {});
  }

  /** Al cambiar de reporte, limpia los campos para que no se filtren de un reporte a otro. */
  onTipoManualChange(): void {
    this.manual = {};
  }

  /** ACCESOS_ARCHIVOS exige usuarioId o archivoId; el resto siempre es válido. */
  manualValido(): boolean {
    if (this.tipoManual === 'ACCESOS_ARCHIVOS') {
      return this.tieneValor(this.manual.usuarioId) || this.tieneValor(this.manual.archivoId);
    }
    return true;
  }

  generarManual(): void {
    if (!this.manualValido()) return;
    this.interpretacion = null;
    this.ejecutar(this.tipoManual, this.parametrosManuales());
  }

  /** Arma los parámetros según el reporte, descartando los campos vacíos. */
  private parametrosManuales(): Record<string, any> {
    const m = this.manual;
    const num = (v: any) => (this.tieneValor(v) ? Number(v) : undefined);
    const txt = (v: any) => (this.tieneValor(v) ? String(v).trim() : undefined);

    let p: Record<string, any> = {};
    switch (this.tipoManual) {
      case 'EMPLEADOS_POR_DEPARTAMENTO':
        p = { departamentoNombre: txt(m.departamentoNombre) };
        break;
      case 'ASISTENCIA_POR_PERIODO':
        p = { desde: txt(m.desde), hasta: txt(m.hasta), empleadoId: num(m.empleadoId) };
        break;
      case 'JUSTIFICACIONES_POR_ESTADO':
        p = { estado: txt(m.estado), desde: txt(m.desde), hasta: txt(m.hasta) };
        break;
      case 'ACCESOS_ARCHIVOS':
        p = { usuarioId: num(m.usuarioId), archivoId: num(m.archivoId), desde: txt(m.desde), hasta: txt(m.hasta) };
        break;
    }
    Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
    return p;
  }

  private tieneValor(v: any): boolean {
    return v != null && String(v).trim() !== '';
  }

  // ── Capa 1: ejecutar ──
  private ejecutar(tipo: string, parametros: Record<string, any>): void {
    this.loadingEjecutar = true;
    this.errorEjecutar = '';
    this.resultado = null;
    this.resumen = '';
    this.service.ejecutar(tipo, parametros).subscribe({
      next: (r) => {
        this.resultado = r;
        this.loadingEjecutar = false;
        this.pedirResumen();
      },
      error: (e) => {
        this.loadingEjecutar = false;
        this.errorEjecutar = this.esForbidden(e)
          ? 'Acceso denegado: este reporte requiere rol administrador.'
          : this.msg(e);
      },
    });
  }

  // ── Capa 2: resumen (no bloqueante) ──
  private pedirResumen(): void {
    if (!this.resultado) return;
    this.loadingResumen = true;
    this.service.resumir(this.resultado.reporte, this.resultado.agregados).subscribe({
      next: (s) => {
        this.resumen = s;
        this.loadingResumen = false;
      },
      error: () => {
        this.loadingResumen = false;
        this.resumen = '';
      },
    });
  }

  // ── Gráfico: primera distribución {clave:número} de los agregados ──
  get grafico(): GraficoData | null {
    const ag = this.resultado?.agregados;
    if (!ag) return null;
    for (const k of ['porDepartamento', 'porEstado', 'porAccion', 'porResultado']) {
      const dist = ag[k];
      if (dist && typeof dist === 'object') {
        const entries = Object.entries(dist).filter(([, v]) => typeof v === 'number') as [string, number][];
        if (entries.length) {
          const max = Math.max(...entries.map(([, v]) => v));
          return {
            titulo: this.tituloDist(k),
            items: entries.map(([label, valor]) => ({
              label,
              valor,
              pct: max ? Math.round((valor / max) * 100) : 0,
            })),
          };
        }
      }
    }
    return null;
  }

  // ── Export CSV (nativo) — separador ';' para Excel español + BOM UTF-8 ──
  exportCsv(): void {
    if (!this.resultado) return;
    const cols = this.resultado.columnas;
    const SEP = ';';
    // Envuelve en comillas si el valor trae el separador, coma, comillas o saltos de línea,
    // y duplica las comillas internas. Así un valor con ';' no rompe las columnas.
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[;",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lineas = [
      cols.map(esc).join(SEP),
      ...this.resultado.filas.map((f) => this.valores(f).map(esc).join(SEP)),
    ];
    const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    this.descargar(blob, this.nombreArchivo('csv'));
  }

  // ── Export PDF (ventana imprimible: el navegador guarda como PDF) ──
  exportPdf(): void {
    if (!this.resultado) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) {
      this.toast.error('No se pudo abrir la ventana', 'Permite las ventanas emergentes para exportar a PDF.');
      return;
    }
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cols = this.resultado.columnas;
    const th = cols.map((c) => `<th>${esc(c)}</th>`).join('');
    const trs = this.resultado.filas
      .map((f) => `<tr>${this.valores(f).map((v) => `<td>${esc(String(v ?? ''))}</td>`).join('')}</tr>`)
      .join('');
    const g = this.grafico;
    const grafHtml = g
      ? `<div class="g"><div class="gt">${esc(g.titulo)}</div>${g.items
          .map(
            (it) =>
              `<div class="gr"><span class="gl">${esc(it.label)}</span><span class="gb"><span style="width:${it.pct}%"></span></span><span class="gv">${it.valor}</span></div>`,
          )
          .join('')}</div>`
      : '';
    const fecha = new Date(this.resultado.generadoEn).toLocaleString();
    // El título del documento es el nombre que el navegador sugiere al guardar como PDF.
    const titulo = this.nombreArchivo('pdf').replace(/\.pdf$/, '');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(titulo)}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;margin:28px;font-size:12px}
        h1{font-size:18px;margin:0 0 2px} .sub{color:#666;font-size:11px;margin-bottom:14px}
        .res{background:#f4f4f7;border-radius:6px;padding:10px 12px;font-size:12px;margin-bottom:14px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px}
        th{background:#f0f0f3}
        .g{margin:6px 0 14px} .gt{color:#666;font-size:11px;margin-bottom:5px}
        .gr{display:flex;align-items:center;gap:8px;margin-bottom:4px}
        .gl{width:170px;text-align:right;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .gb{flex:1;background:#e9e9ef;border-radius:4px;height:13px;overflow:hidden}
        .gb>span{display:block;height:100%;background:#4f46e5}
        .gv{width:30px;font-weight:700;font-size:11px}
        @media print{button{display:none}}
      </style></head><body>
      <h1>${esc(this.labelDe(this.resultado.reporte))}</h1>
      <div class="sub">Generado: ${esc(fecha)}</div>
      ${this.resumen ? `<div class="res"><b>Resumen IA:</b> ${esc(this.resumen)}</div>` : ''}
      ${grafHtml}
      <table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>
      <script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
      </body></html>`);
    w.document.close();
  }

  // ── helpers ──
  valores(fila: Record<string, any>): unknown[] {
    return Object.values(fila);
  }

  labelDe(tipo: string): string {
    return REPORTES.find((r) => r.tipo === tipo)?.label ?? tipo;
  }

  paramsLegibles(params: Record<string, any> | null | undefined): string {
    const e = Object.entries(params ?? {}).filter(([, v]) => v != null && v !== '');
    return e.length ? e.map(([k, v]) => `${k}: ${v}`).join(' · ') : 'sin filtros';
  }

  private tituloDist(k: string): string {
    return (
      {
        porDepartamento: 'Distribución por departamento',
        porEstado: 'Distribución por estado',
        porAccion: 'Distribución por acción',
        porResultado: 'Distribución por resultado',
      } as Record<string, string>
    )[k] ?? k;
  }

  /** Nombre único y descriptivo: reporte_<tipo>_<YYYY-MM-DD>_<HHmm>.<ext> */
  private nombreArchivo(ext: string): string {
    const tipo = (this.resultado?.reporte ?? 'reporte').toLowerCase();
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const fecha = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    const hora = `${p(d.getHours())}${p(d.getMinutes())}`;
    return `reporte_${tipo}_${fecha}_${hora}.${ext}`;
  }

  private descargar(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  }

  private esForbidden(e: any): boolean {
    const m = (e?.message ?? '').toLowerCase();
    return e?.status === 403 || m.includes('forbidden') || m.includes('privilegio') || m.includes('autorizad');
  }

  private msg(e: any): string {
    if (e?.status === 0) return 'Sin conexión con el backend de reportes (Nest). ¿Está levantado?';
    return e?.message || 'Error inesperado.';
  }
}
