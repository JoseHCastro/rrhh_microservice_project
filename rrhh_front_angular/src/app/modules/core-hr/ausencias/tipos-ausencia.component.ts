import { Component, OnInit } from '@angular/core';
import { AusenciaService } from '../services/ausencia.service';
import { TipoAusencia } from '../models/rrhh.models';

@Component({
  selector: 'app-tipos-ausencia',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Tipos de Ausencia</b></div>
          <h1>Tipos de Ausencia</h1>
        </div>
      </div>
      <div class="card">
        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>
        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar los tipos</h4><p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>
        <div class="tw" *ngIf="!loading && !error">
          <table>
            <thead><tr><th>#</th><th>Tipo de ausencia</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of tipos">
                <td class="mn">{{ t.id }}</td>
                <td>
                  <div class="cs">
                    <div class="sic" style="background:var(--info)"><app-icon name="calendarX" [size]="16"></app-icon></div>
                    <div class="sn">{{ t.nombre }}</div>
                  </div>
                </td>
              </tr>
              <tr *ngIf="tipos.length === 0"><td colspan="2"><div class="es"><h4>Sin tipos</h4></div></td></tr>
            </tbody>
          </table>
        </div>
        <div class="tft" *ngIf="!loading && !error"><span>Solo lectura · el schema GraphQL no expone mutación de tipos</span></div>
      </div>
    </div>
  `,
})
export class TiposAusenciaComponent implements OnInit {
  tipos: TipoAusencia[] = [];
  loading = true;
  error = '';
  constructor(private ausencias: AusenciaService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.ausencias.getTipos().subscribe({
      next: (t) => { this.tipos = t; this.loading = false; },
      error: (e) => { this.loading = false; this.error = e?.status === 0 ? 'Sin conexión con el backend.' : e?.message || 'Error'; },
    });
  }
}
