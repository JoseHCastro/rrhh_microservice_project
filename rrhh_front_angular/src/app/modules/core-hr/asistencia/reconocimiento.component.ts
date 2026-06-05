import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { AsistenciaService } from '../services/asistencia.service';
import { EmpleadoService } from '../services/empleado.service';
import { Empleado } from '../models/rrhh.models';

@Component({
  selector: 'app-reconocimiento',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Reconocimiento Biométrico</b></div>
          <h1>Reconocimiento Biométrico</h1>
        </div>
      </div>

      <div class="card" style="max-width:560px">
        <div class="chd">
          <div class="chl">
            <div class="chi ci"><app-icon name="scanFace" [size]="17"></app-icon></div>
            <div><h3>Enrolar rostro</h3><div class="chs">Vincula un código facial a un empleado</div></div>
          </div>
        </div>
        <div style="padding:18px">
          <div class="fr one">
            <div class="ff">
              <label>Empleado *</label>
              <select [(ngModel)]="empleadoId"><option value="">Seleccionar…</option>
                <option *ngFor="let e of empleados" [value]="e.id">{{ e.nombreCompleto }}</option></select>
            </div>
          </div>
          <div class="fr one">
            <div class="ff">
              <label>Código facial (generado por el sensor)</label>
              <input type="text" [(ngModel)]="codigoFacial" placeholder="FACE_XYZ_123" />
            </div>
          </div>
          <button class="btn pri" (click)="enrolar()" [disabled]="saving">
            <app-icon name="scanFace" [size]="16"></app-icon> {{ saving ? 'Enrolando…' : 'Enrolar rostro' }}
          </button>
        </div>
        <div class="tft"><span>Mutación: enrolarRostro · el schema no expone listado de rostros enrolados</span></div>
      </div>
    </div>
  `,
})
export class ReconocimientoComponent implements OnInit {
  empleados: Empleado[] = [];
  empleadoId = '';
  codigoFacial = '';
  saving = false;

  constructor(
    private service: AsistenciaService,
    private empleadoSvc: EmpleadoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.empleadoSvc.getPage(0, 200).subscribe({ next: (p) => (this.empleados = p.content), error: () => {} });
    this.codigoFacial = 'FACE_' + Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  enrolar(): void {
    if (!this.empleadoId || !this.codigoFacial.trim()) { this.toast.warn('Selecciona empleado y código'); return; }
    this.saving = true;
    this.service.enrolarRostro(this.empleadoId, this.codigoFacial.trim()).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Rostro enrolado', 'Código vinculado');
        this.codigoFacial = 'FACE_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        this.empleadoId = '';
      },
      error: (e) => { this.saving = false; this.toast.error('No se pudo enrolar', e?.status === 0 ? 'Sin conexión' : e?.message || ''); },
    });
  }
}
