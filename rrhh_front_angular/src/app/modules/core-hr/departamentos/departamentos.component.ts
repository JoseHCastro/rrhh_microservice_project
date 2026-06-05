import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { DepartamentoService } from '../services/departamento.service';
import { Departamento } from '../models/rrhh.models';

@Component({
  selector: 'app-departamentos',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Departamentos</b></div>
          <h1>Departamentos</h1>
        </div>
        <div class="pha">
          <button class="btn pri" (click)="modalOpen = true">
            <app-icon name="plus" [size]="16"></app-icon><span>Nuevo departamento</span>
          </button>
        </div>
      </div>

      <div class="loadc" *ngIf="loading"><div class="spin"></div></div>

      <div class="card" *ngIf="error && !loading">
        <div class="es">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar los departamentos</h4>
          <p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>
      </div>

      <div class="cgrid" *ngIf="!loading && !error" style="padding:0">
        <div class="dcard" *ngFor="let d of departamentos">
          <div class="chi ci" style="margin-bottom:14px"><app-icon name="building2" [size]="20"></app-icon></div>
          <div style="font-size:15px;font-weight:700">{{ d.nombre }}</div>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px">
            Gerente: {{ d.gerente?.nombreCompleto || 'Sin asignar' }}
          </div>
        </div>
        <div class="dcard" *ngIf="departamentos.length === 0" style="cursor:default">
          <div class="es"><h4>Sin departamentos</h4><p>Crea el primero.</p></div>
        </div>
      </div>
    </div>

    <app-modal [open]="modalOpen" title="Nuevo Departamento" [okLabel]="saving ? 'Guardando…' : 'Crear'"
               (close)="modalOpen = false" (confirm)="save()">
      <div class="fr one">
        <div class="ff">
          <label>Nombre del departamento</label>
          <input type="text" [(ngModel)]="nombre" placeholder="Ej. Operaciones IT" />
        </div>
      </div>
    </app-modal>
  `,
})
export class DepartamentosComponent implements OnInit {
  departamentos: Departamento[] = [];
  loading = true;
  error = '';
  modalOpen = false;
  saving = false;
  nombre = '';

  constructor(private service: DepartamentoService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (d) => {
        this.departamentos = d;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.status === 0 ? 'Sin conexión con el backend (localhost:8080).' : e?.message || 'Error';
      },
    });
  }

  save(): void {
    if (!this.nombre.trim()) {
      this.toast.warn('Ingresa un nombre');
      return;
    }
    this.saving = true;
    this.service.create(this.nombre.trim()).subscribe({
      next: (d) => {
        this.saving = false;
        this.modalOpen = false;
        this.nombre = '';
        this.toast.success('Departamento creado', d.nombre);
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.toast.error('No se pudo crear', e?.message || '');
      },
    });
  }
}
