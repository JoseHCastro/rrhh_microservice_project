import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { AsistenciaService } from '../services/asistencia.service';
import { EstadoSistema, SistemaConfig } from '../models/rrhh.models';

@Component({
  selector: 'app-dispositivos',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Dispositivos IoT</b></div>
          <h1>Dispositivos IoT · Estado del Sistema</h1>
        </div>
        <div class="pha">
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="16"></app-icon><span>Actualizar</span></button>
        </div>
      </div>

      <div class="loadc" *ngIf="loading"><div class="spin"></div></div>
      <div class="card" *ngIf="error && !loading">
        <div class="es"><div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudo cargar el estado</h4><p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button></div>
      </div>

      <ng-container *ngIf="!loading && !error">
        <div class="card" style="margin-bottom:16px">
          <div class="chd">
            <div class="chl">
              <div class="chi ce"><app-icon name="cpu" [size]="17"></app-icon></div>
              <div><h3>Estado actual del sensor</h3><div class="chs">Control de emparejamiento / lectura IoT</div></div>
            </div>
            <span class="bst bok" *ngIf="sistema"><span class="bd2"></span>{{ sistema.estado }}</span>
          </div>
          <div style="padding:18px">
            <div class="igrid">
              <div class="iit"><div class="il">Estado</div><div class="iv">{{ sistema?.estado || '—' }}</div></div>
              <div class="iit"><div class="il">Última actualización</div><div class="iv">{{ sistema?.fechaHoraEstado ? (sistema?.fechaHoraEstado | date: 'dd MMM y, HH:mm') : '—' }}</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="sh"><h4>Cambiar estado del sistema</h4></div>
          <div style="padding:18px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn" *ngFor="let e of estados" [class.pri]="sistema?.estado === e" (click)="cambiar(e)" [disabled]="saving">
              <app-icon name="cpu" [size]="15"></app-icon> {{ e }}
            </button>
          </div>
          <div class="tft"><span>Mutación: cambiarEstadoSistema</span></div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DispositivosComponent implements OnInit {
  sistema: SistemaConfig | null = null;
  loading = true;
  error = '';
  saving = false;
  readonly estados = Object.values(EstadoSistema);

  constructor(private service: AsistenciaService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getSistema().subscribe({
      next: (s) => { this.sistema = s; this.loading = false; },
      error: (e) => { this.loading = false; this.error = e?.status === 0 ? 'Sin conexión con el backend (localhost:8080).' : e?.message || 'Error'; },
    });
  }

  cambiar(estado: EstadoSistema): void {
    this.saving = true;
    this.service.cambiarEstado(estado).subscribe({
      next: (s) => { this.saving = false; this.sistema = s; this.toast.success('Estado actualizado', estado); },
      error: (e) => { this.saving = false; this.toast.error('No se pudo cambiar', e?.message || ''); },
    });
  }
}
