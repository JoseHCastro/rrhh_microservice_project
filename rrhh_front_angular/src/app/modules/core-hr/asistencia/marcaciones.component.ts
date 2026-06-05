import { Component, OnInit } from '@angular/core';
import { AsistenciaService } from '../services/asistencia.service';
import { RegistroAsistenciaPage } from '../models/rrhh.models';

@Component({
  selector: 'app-marcaciones',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Registro de Marcaciones</b></div>
          <h1>Registro de Marcaciones</h1>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px" *ngIf="page && !loading && !error">
            {{ page.pageInfo.totalElements }} marcaciones registradas
          </div>
        </div>
      </div>

      <div class="card">
        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>
        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar las marcaciones</h4><p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>

        <div class="tw" *ngIf="!loading && !error">
          <table>
            <thead><tr><th>Empleado</th><th>Entrada</th><th>Salida</th><th>Ubicación GPS</th><th>Estado</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of page?.content || []">
                <td><div class="sn">{{ r.empleado?.nombreCompleto || '—' }}</div></td>
                <td class="mn">{{ r.horaEntrada | date: 'dd MMM, HH:mm' }}</td>
                <td class="mn">{{ r.horaSalida ? (r.horaSalida | date: 'dd MMM, HH:mm') : '—' }}</td>
                <td class="mn" style="font-size:11px">{{ r.ubicacionGps || '—' }}</td>
                <td>
                  <span class="bst" [class.bok]="r.estado === 'REGISTRADO'" [class.bwn]="r.estado === 'RETRASO'" [class.bbd]="r.estado === 'MARCACION_OBSERVADA'">
                    <span class="bd2"></span>{{ r.estado }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="(page?.content || []).length === 0"><td colspan="5"><div class="es"><div class="esic ci"><app-icon name="clock" [size]="22"></app-icon></div><h4>Sin marcaciones</h4></div></td></tr>
            </tbody>
          </table>
        </div>

        <div class="tft" *ngIf="page && !loading && !error">
          <span>Página {{ page.pageInfo.currentPage + 1 }} de {{ page.pageInfo.totalPages || 1 }}</span>
          <span style="display:flex;gap:8px">
            <button class="btn sm" [disabled]="pageIndex === 0" (click)="prev()">Anterior</button>
            <button class="btn sm" [disabled]="!page.pageInfo.hasNext" (click)="next()">Siguiente</button>
          </span>
        </div>
      </div>
    </div>
  `,
})
export class MarcacionesComponent implements OnInit {
  page?: RegistroAsistenciaPage;
  loading = true;
  error = '';
  pageIndex = 0;
  readonly size = 15;

  constructor(private service: AsistenciaService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getRegistros(null, this.pageIndex, this.size).subscribe({
      next: (p) => { this.page = p; this.loading = false; },
      error: (e) => { this.loading = false; this.error = e?.status === 0 ? 'Sin conexión con el backend (localhost:8080).' : e?.message || 'Error'; },
    });
  }

  next(): void { if (this.page?.pageInfo.hasNext) { this.pageIndex++; this.load(); } }
  prev(): void { if (this.pageIndex > 0) { this.pageIndex--; this.load(); } }
}
