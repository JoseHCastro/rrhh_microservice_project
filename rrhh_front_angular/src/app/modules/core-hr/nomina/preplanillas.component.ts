import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { PreplanillaService } from '../services/preplanilla.service';
import { EmpleadoService } from '../services/empleado.service';
import { Empleado, Preplanilla } from '../models/rrhh.models';

@Component({
  selector: 'app-preplanillas',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Preplanillas Mensuales</b></div>
          <h1>Preplanillas Mensuales</h1>
        </div>
        <div class="pha">
          <button class="btn pri" (click)="openModal()"><app-icon name="fileText" [size]="16"></app-icon><span>Generar preplanilla</span></button>
        </div>
      </div>

      <div class="card">
        <div class="fb">
          <input type="text" [(ngModel)]="periodo" placeholder="Período YYYY-MM (opcional)" (keyup.enter)="load()" />
          <button class="btn sm" (click)="load()">Filtrar</button>
        </div>

        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>
        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar las preplanillas</h4><p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>

        <div class="tw" *ngIf="!loading && !error">
          <table>
            <thead><tr><th>Empleado</th><th>Período</th><th>Días</th><th>Faltas</th><th>Retrasos</th><th>H. Extra</th><th>Doc.</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of preplanillas">
                <td><div class="sn">{{ p.empleado?.nombreCompleto || '—' }}</div></td>
                <td class="mn">{{ p.periodo }}</td>
                <td class="mn">{{ p.diasTrabajados }}</td>
                <td class="mn">{{ p.faltas }}</td>
                <td class="mn">{{ p.retrasos }}</td>
                <td class="mn">{{ p.horasExtra }}h</td>
                <td>
                  <a *ngIf="p.s3KeyUri" class="ab vw" [href]="p.s3KeyUri" target="_blank"><app-icon name="download" [size]="13"></app-icon> PDF</a>
                  <span *ngIf="!p.s3KeyUri" class="mt" style="font-size:11px">—</span>
                </td>
              </tr>
              <tr *ngIf="preplanillas.length === 0"><td colspan="7"><div class="es"><div class="esic ci"><app-icon name="fileText" [size]="22"></app-icon></div><h4>Sin preplanillas</h4><p>Genera la primera con el botón superior.</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-modal [open]="modalOpen" title="Generar Preplanilla" [okLabel]="saving ? 'Generando…' : 'Generar'"
               (close)="modalOpen = false" (confirm)="generar()">
      <div class="fr">
        <div class="ff">
          <label>Empleado *</label>
          <select [(ngModel)]="genEmpleadoId"><option value="">Seleccionar…</option>
            <option *ngFor="let e of empleados" [value]="e.id">{{ e.nombreCompleto }}</option></select>
        </div>
        <div class="ff"><label>Período (YYYY-MM) *</label><input type="text" [(ngModel)]="genPeriodo" placeholder="2026-06" /></div>
      </div>
    </app-modal>
  `,
})
export class PreplanillasComponent implements OnInit {
  preplanillas: Preplanilla[] = [];
  loading = true;
  error = '';
  periodo = '';

  modalOpen = false;
  saving = false;
  empleados: Empleado[] = [];
  genEmpleadoId = '';
  genPeriodo = '';

  constructor(
    private service: PreplanillaService,
    private empleadoSvc: EmpleadoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getPreplanillas(null, this.periodo || null).subscribe({
      next: (p) => { this.preplanillas = p; this.loading = false; },
      error: (e) => { this.loading = false; this.error = e?.status === 0 ? 'Sin conexión con el backend (localhost:8080).' : e?.message || 'Error'; },
    });
  }

  openModal(): void {
    this.genEmpleadoId = ''; this.genPeriodo = '';
    if (!this.empleados.length) this.empleadoSvc.getPage(0, 200).subscribe({ next: (p) => (this.empleados = p.content), error: () => {} });
    this.modalOpen = true;
  }

  generar(): void {
    if (!this.genEmpleadoId || !this.genPeriodo) { this.toast.warn('Selecciona empleado y período'); return; }
    this.saving = true;
    this.service.generar(this.genEmpleadoId, this.genPeriodo).subscribe({
      next: () => { this.saving = false; this.modalOpen = false; this.toast.success('Preplanilla generada', 'Período ' + this.genPeriodo); this.load(); },
      error: (e) => { this.saving = false; this.toast.error('No se pudo generar', e?.message || ''); },
    });
  }
}
