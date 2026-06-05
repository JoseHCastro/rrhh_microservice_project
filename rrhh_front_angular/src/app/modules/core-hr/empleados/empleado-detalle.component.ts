import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { EmpleadoService } from '../services/empleado.service';
import {
  Empleado,
  EstadoEmpleado,
  Preplanilla,
  RegistroAsistencia,
  SolicitudAusencia,
} from '../models/rrhh.models';

type Tab = 'info' | 'asistencia' | 'preplanillas' | 'solicitudes';

@Component({
  selector: 'app-empleado-detalle',
  templateUrl: './empleado-detalle.component.html',
})
export class EmpleadoDetalleComponent implements OnInit {
  empleado?: Empleado;
  loading = true;
  error = '';

  tab: Tab = 'info';
  asistencia: RegistroAsistencia[] = [];
  preplanillas: Preplanilla[] = [];
  solicitudes: SolicitudAusencia[] = [];
  loadedTabs = new Set<Tab>();

  readonly EstadoEmpleado = EstadoEmpleado;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleados: EmpleadoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    // Si venimos de la lista, ya traemos departamento/cargo en el router state.
    const fromList = history.state?.empleado as Empleado | undefined;
    if (fromList && fromList.id === id) {
      this.empleado = fromList;
      this.loading = false;
    }

    // Refrescamos los escalares desde el backend (sin anidados) y mezclamos,
    // conservando departamento/cargo que vinieron de la lista.
    this.empleados.getById(id).subscribe({
      next: (e) => {
        this.empleado = { ...(this.empleado || {}), ...e } as Empleado;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        if (!this.empleado) {
          this.error = e?.status === 0 ? 'Sin conexión con el backend.' : e?.message || 'Error';
        }
      },
    });
  }

  setTab(t: Tab): void {
    this.tab = t;
    if (t === 'info' || this.loadedTabs.has(t) || !this.empleado) return;
    this.loadedTabs.add(t);
    const id = this.empleado.id;
    if (t === 'asistencia')
      this.empleados.getAsistencia(id).subscribe({ next: (r) => (this.asistencia = r), error: () => {} });
    if (t === 'preplanillas')
      this.empleados.getPreplanillas(id).subscribe({ next: (r) => (this.preplanillas = r), error: () => {} });
    if (t === 'solicitudes')
      this.empleados.getSolicitudes(id).subscribe({ next: (r) => (this.solicitudes = r), error: () => {} });
  }

  initials(): string {
    const e = this.empleado;
    return e ? (e.nombre[0] || '') + (e.apellido[0] || '') : '';
  }

  back(): void {
    this.router.navigate(['/empleados']);
  }

  desactivar(): void {
    if (!this.empleado) return;
    this.empleados.deactivate(this.empleado.id).subscribe({
      next: () => {
        this.toast.warn('Empleado desactivado', this.empleado!.nombreCompleto);
        this.empleado!.estado = EstadoEmpleado.INACTIVO;
      },
      error: (e) => this.toast.error('No se pudo desactivar', e?.message || ''),
    });
  }
}
