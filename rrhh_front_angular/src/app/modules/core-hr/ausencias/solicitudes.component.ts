import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { AusenciaService } from '../services/ausencia.service';
import { EmpleadoService } from '../services/empleado.service';
import { Empleado, EstadoSolicitud, SolicitudAusencia, TipoAusencia } from '../models/rrhh.models';

@Component({
  selector: 'app-solicitudes',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Bandeja de Solicitudes</b></div>
          <h1>Bandeja de Solicitudes</h1>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px" *ngIf="!loading && !error">
            {{ solicitudes.length }} solicitudes · {{ pendientes }} pendientes
          </div>
        </div>
        <div class="pha">
          <button class="btn pri" (click)="openModal()"><app-icon name="plus" [size]="16"></app-icon><span>Nueva solicitud</span></button>
        </div>
      </div>

      <div class="card">
        <div class="fb">
          <select [(ngModel)]="estado" (change)="load()">
            <option value="">Todos los estados</option>
            <option [value]="ES.PENDIENTE">Pendientes</option>
            <option [value]="ES.APROBADA">Aprobadas</option>
            <option [value]="ES.RECHAZADA">Rechazadas</option>
          </select>
        </div>

        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>
        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar las solicitudes</h4><p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>

        <div class="tw" *ngIf="!loading && !error">
          <table>
            <thead><tr><th>Empleado</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of solicitudes">
                <td><div class="sn">{{ s.empleado?.nombreCompleto || '—' }}</div></td>
                <td class="mt">{{ s.tipoAusencia.nombre }}</td>
                <td class="mn">{{ s.fechaInicio | date: 'dd MMM y' }}</td>
                <td class="mn">{{ s.fechaFin | date: 'dd MMM y' }}</td>
                <td>
                  <span class="bst" [class.bok]="s.estado === ES.APROBADA" [class.bwn]="s.estado === ES.PENDIENTE" [class.bbd]="s.estado === ES.RECHAZADA">
                    <span class="bd2"></span>{{ s.estado }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:6px" *ngIf="s.estado === ES.PENDIENTE; else sinAcc">
                    <button class="ab ap" (click)="aprobar(s)"><app-icon name="check" [size]="13" [stroke]="2.5"></app-icon> Aprobar</button>
                    <button class="ab rj" (click)="rechazar(s)"><app-icon name="x" [size]="13" [stroke]="2.5"></app-icon> Rechazar</button>
                  </div>
                  <ng-template #sinAcc><span class="mt" style="font-size:11px">—</span></ng-template>
                </td>
              </tr>
              <tr *ngIf="solicitudes.length === 0"><td colspan="6"><div class="es"><div class="esic ce"><app-icon name="inbox" [size]="22"></app-icon></div><h4>Sin solicitudes</h4><p>No hay solicitudes para este filtro.</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-modal [open]="modalOpen" title="Nueva Solicitud de Ausencia" [okLabel]="saving ? 'Enviando…' : 'Crear solicitud'"
               (close)="modalOpen = false" (confirm)="crear()">
      <div class="fr">
        <div class="ff">
          <label>Empleado *</label>
          <select [(ngModel)]="form.empleadoId"><option value="">Seleccionar…</option>
            <option *ngFor="let e of empleados" [value]="e.id">{{ e.nombreCompleto }}</option></select>
        </div>
        <div class="ff">
          <label>Tipo de ausencia *</label>
          <select [(ngModel)]="form.tipoAusenciaId"><option value="">Seleccionar…</option>
            <option *ngFor="let t of tipos" [value]="t.id">{{ t.nombre }}</option></select>
        </div>
      </div>
      <div class="fr">
        <div class="ff"><label>Fecha inicio *</label><input type="date" [(ngModel)]="form.fechaInicio" /></div>
        <div class="ff"><label>Fecha fin *</label><input type="date" [(ngModel)]="form.fechaFin" /></div>
      </div>
    </app-modal>
  `,
})
export class SolicitudesComponent implements OnInit {
  solicitudes: SolicitudAusencia[] = [];
  loading = true;
  error = '';
  estado: EstadoSolicitud | '' = '';

  modalOpen = false;
  saving = false;
  empleados: Empleado[] = [];
  tipos: TipoAusencia[] = [];
  form = { empleadoId: '', tipoAusenciaId: '', fechaInicio: '', fechaFin: '' };

  readonly ES = EstadoSolicitud;

  constructor(
    private ausencias: AusenciaService,
    private empleadoSvc: EmpleadoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get pendientes(): number {
    return this.solicitudes.filter((s) => s.estado === EstadoSolicitud.PENDIENTE).length;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.ausencias.getSolicitudes(this.estado || null, null).subscribe({
      next: (s) => { this.solicitudes = s; this.loading = false; },
      error: (e) => { this.loading = false; this.error = this.msg(e); },
    });
  }

  aprobar(s: SolicitudAusencia): void {
    this.ausencias.aprobar(s.id).subscribe({
      next: () => { this.toast.success('Solicitud aprobada', s.empleado?.nombreCompleto); this.load(); },
      error: (e) => this.toast.error('No se pudo aprobar', this.msg(e)),
    });
  }

  rechazar(s: SolicitudAusencia): void {
    this.ausencias.rechazar(s.id).subscribe({
      next: () => { this.toast.warn('Solicitud rechazada', s.empleado?.nombreCompleto); this.load(); },
      error: (e) => this.toast.error('No se pudo rechazar', this.msg(e)),
    });
  }

  openModal(): void {
    this.form = { empleadoId: '', tipoAusenciaId: '', fechaInicio: '', fechaFin: '' };
    if (!this.tipos.length) this.ausencias.getTipos().subscribe({ next: (t) => (this.tipos = t), error: () => {} });
    if (!this.empleados.length)
      this.empleadoSvc.getPage(0, 200).subscribe({ next: (p) => (this.empleados = p.content), error: () => {} });
    this.modalOpen = true;
  }

  crear(): void {
    const f = this.form;
    if (!f.empleadoId || !f.tipoAusenciaId || !f.fechaInicio || !f.fechaFin) {
      this.toast.warn('Completa todos los campos');
      return;
    }
    this.saving = true;
    this.ausencias.crear(f).subscribe({
      next: () => { this.saving = false; this.modalOpen = false; this.toast.success('Solicitud creada'); this.load(); },
      error: (e) => { this.saving = false; this.toast.error('No se pudo crear', this.msg(e)); },
    });
  }

  private msg(e: any): string {
    if (e?.status === 0) return 'Sin conexión con el backend (localhost:8080).';
    return e?.message || 'Error inesperado';
  }
}
