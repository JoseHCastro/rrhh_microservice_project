import { Component, OnInit } from '@angular/core';
import { CargoService } from '../services/cargo.service';
import { Cargo } from '../models/rrhh.models';

@Component({
  selector: 'app-cargos',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Cargos y Salarios</b></div>
          <h1>Cargos y Salarios</h1>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px" *ngIf="!loading && !error">
            {{ cargos.length }} cargos definidos
          </div>
        </div>
      </div>

      <div class="card">
        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>

        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar los cargos</h4>
          <p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>

        <div class="tw" *ngIf="!loading && !error">
          <table>
            <thead><tr><th>Cargo</th><th>Salario por hora</th><th style="width:38%">Escala</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of cargos">
                <td>
                  <div class="cs">
                    <div class="sic" style="background:var(--brand)"><app-icon name="briefcase" [size]="16"></app-icon></div>
                    <div class="sn">{{ c.nombre }}</div>
                  </div>
                </td>
                <td class="mn" style="font-size:14px;font-weight:700;color:var(--tx)">{{ c.salarioPorHora | currency: 'USD' }}</td>
                <td>
                  <div class="sbar"><i [style.width.%]="pct(c)"></i></div>
                </td>
              </tr>
              <tr *ngIf="cargos.length === 0"><td colspan="3"><div class="es"><h4>Sin cargos</h4></div></td></tr>
            </tbody>
          </table>
        </div>
        <div class="tft" *ngIf="!loading && !error">
          <span>Solo lectura · el schema GraphQL no expone mutación de cargos</span>
        </div>
      </div>
    </div>
  `,
})
export class CargosComponent implements OnInit {
  cargos: Cargo[] = [];
  loading = true;
  error = '';
  private max = 1;

  constructor(private service: CargoService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (c) => {
        this.cargos = c;
        this.max = Math.max(1, ...c.map((x) => x.salarioPorHora));
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.status === 0 ? 'Sin conexión con el backend (localhost:8080).' : e?.message || 'Error';
      },
    });
  }

  pct(c: Cargo): number {
    return Math.round((c.salarioPorHora / this.max) * 100);
  }
}
