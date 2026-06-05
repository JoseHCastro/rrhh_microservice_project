import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { UsuarioService } from '../services/usuario.service';
import { NombreRol, Usuario } from '../models/rrhh.models';

@Component({
  selector: 'app-usuarios',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Usuarios y Roles</b></div>
          <h1>Usuarios y Roles</h1>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px" *ngIf="!loading && !error">
            {{ usuarios.length }} usuarios · {{ activos }} activos
          </div>
        </div>
      </div>

      <div class="card">
        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>
        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudieron cargar los usuarios</h4><p>{{ error }}</p>
          <button class="btn" (click)="load()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>

        <div class="tw" *ngIf="!loading && !error">
          <table>
            <thead><tr><th>Usuario</th><th>Roles</th><th>Creado</th><th>Estado</th><th>Activo</th><th>Rol</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of usuarios">
                <td>
                  <div class="cs">
                    <div class="sic" style="background:var(--brand)">{{ ini(u) }}</div>
                    <div class="sn">{{ u.username }}</div>
                  </div>
                </td>
                <td>
                  <span class="bst bsl" style="font-size:10px;padding:3px 8px;margin-right:4px" *ngFor="let r of u.roles">
                    <span class="bd2"></span>{{ label(r.rol.nombre) }}
                  </span>
                  <span class="mt" *ngIf="u.roles.length === 0" style="font-size:11px">Sin roles</span>
                </td>
                <td class="mn">{{ u.createdAt ? (u.createdAt | date: 'dd MMM y') : '—' }}</td>
                <td>
                  <span class="bst" [class.bok]="u.activo" [class.bsl]="!u.activo"><span class="bd2"></span>{{ u.activo ? 'ACTIVO' : 'INACTIVO' }}</span>
                </td>
                <td><button class="sw" [class.on]="u.activo" (click)="toggle(u)" [title]="u.activo ? 'Desactivar' : 'Activar'"></button></td>
                <td><button class="ab vw" (click)="openRol(u)"><app-icon name="shield" [size]="13"></app-icon> Asignar</button></td>
              </tr>
              <tr *ngIf="usuarios.length === 0"><td colspan="6"><div class="es"><h4>Sin usuarios</h4></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-modal [open]="modalOpen" [title]="'Asignar rol a ' + (sel?.username || '')" [okLabel]="saving ? 'Asignando…' : 'Asignar rol'"
               (close)="modalOpen = false" (confirm)="asignar()">
      <div class="fr one">
        <div class="ff">
          <label>Rol</label>
          <select [(ngModel)]="rolSel">
            <option [value]="R.ROLE_ADMIN">Admin</option>
            <option [value]="R.ROLE_RRHH">RRHH</option>
            <option [value]="R.ROLE_SUPERVISOR">Supervisor</option>
            <option [value]="R.ROLE_EMPLEADO">Empleado</option>
          </select>
        </div>
      </div>
    </app-modal>
  `,
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  error = '';

  modalOpen = false;
  saving = false;
  sel?: Usuario;
  rolSel: NombreRol = NombreRol.ROLE_EMPLEADO;

  readonly R = NombreRol;

  constructor(private service: UsuarioService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  get activos(): number { return this.usuarios.filter((u) => u.activo).length; }

  ini(u: Usuario): string { return (u.username || '??').slice(0, 2).toUpperCase(); }
  label(r: string): string {
    return { ROLE_ADMIN: 'Admin', ROLE_RRHH: 'RRHH', ROLE_SUPERVISOR: 'Supervisor', ROLE_EMPLEADO: 'Empleado' }[r] || r;
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getUsuarios().subscribe({
      next: (u) => { this.usuarios = u; this.loading = false; },
      error: (e) => { this.loading = false; this.error = e?.status === 0 ? 'Sin conexión con el backend (localhost:8080).' : e?.message || 'Error'; },
    });
  }

  toggle(u: Usuario): void {
    const op = u.activo ? this.service.desactivar(u.id) : this.service.activar(u.id);
    op.subscribe({
      next: () => { u.activo = !u.activo; this.toast.show(u.activo ? 'Usuario activado' : 'Usuario desactivado', u.username, u.activo ? 'tok' : 'twn'); },
      error: (e) => this.toast.error('No se pudo cambiar el estado', e?.message || ''),
    });
  }

  openRol(u: Usuario): void { this.sel = u; this.rolSel = NombreRol.ROLE_EMPLEADO; this.modalOpen = true; }

  asignar(): void {
    if (!this.sel) return;
    this.saving = true;
    this.service.asignarRol(this.sel.id, this.rolSel).subscribe({
      next: () => { this.saving = false; this.modalOpen = false; this.toast.success('Rol asignado', this.label(this.rolSel)); this.load(); },
      error: (e) => { this.saving = false; this.toast.error('No se pudo asignar', e?.message || ''); },
    });
  }
}
