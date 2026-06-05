import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { CargoService } from '../services/cargo.service';
import { DepartamentoService } from '../services/departamento.service';
import { EmpleadoService } from '../services/empleado.service';
import { Cargo, Departamento, Empleado, EmpleadoPage, EstadoEmpleado } from '../models/rrhh.models';

@Component({
  selector: 'app-empleados-list',
  templateUrl: './empleados-list.component.html',
})
export class EmpleadosListComponent implements OnInit {
  page?: EmpleadoPage;
  loading = false;
  error = '';

  departamentos: Departamento[] = [];
  cargos: Cargo[] = [];

  // Filtros
  search = '';
  estado: EstadoEmpleado | '' = '';
  deptId = '';
  pageIndex = 0;
  readonly size = 10;

  // Modal de creación
  modalOpen = false;
  saving = false;
  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    departamentoId: ['', Validators.required],
    cargoId: ['', Validators.required],
    fechaContratacion: [new Date().toISOString().slice(0, 10), Validators.required],
    horaEntrada: ['08:00', Validators.required],
    horaSalida: ['17:00', Validators.required],
    telefono: [''],
    carnetIdentidad: [''],
  });

  readonly EstadoEmpleado = EstadoEmpleado;

  constructor(
    private empleados: EmpleadoService,
    private deptos: DepartamentoService,
    private cargoSvc: CargoService,
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.deptos.getAll().subscribe({ next: (d) => (this.departamentos = d), error: () => {} });
    this.cargoSvc.getAll().subscribe({ next: (c) => (this.cargos = c), error: () => {} });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.empleados.getPage(this.pageIndex, this.size, this.estado || null, this.deptId || null).subscribe({
      next: (p) => {
        this.page = p;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = this.msg(e);
      },
    });
  }

  get rows(): Empleado[] {
    const list = this.page?.content ?? [];
    if (!this.search) return list;
    const q = this.search.toLowerCase();
    return list.filter(
      (e) => e.nombreCompleto.toLowerCase().includes(q) || (e.carnetIdentidad ?? '').includes(q)
    );
  }

  changeFilter(): void {
    this.pageIndex = 0;
    this.load();
  }

  next(): void {
    if (this.page?.pageInfo.hasNext) {
      this.pageIndex++;
      this.load();
    }
  }
  prev(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.load();
    }
  }

  open(e: Empleado): void {
    // Pasamos el empleado (con departamento/cargo ya resueltos) al detalle,
    // porque el resolver empleado(id) no los devuelve.
    this.router.navigate(['/empleados', e.id], { state: { empleado: e } });
  }

  initials(e: Empleado): string {
    return (e.nombre[0] || '') + (e.apellido[0] || '');
  }

  // ---- Crear empleado ----
  openModal(): void {
    this.form.reset({
      nombre: '',
      apellido: '',
      departamentoId: '',
      cargoId: '',
      fechaContratacion: new Date().toISOString().slice(0, 10),
      horaEntrada: '08:00',
      horaSalida: '17:00',
      telefono: '',
      carnetIdentidad: '',
    });
    this.modalOpen = true;
  }

  save(): void {
    if (this.form.invalid) {
      this.toast.warn('Completa los campos obligatorios');
      return;
    }
    this.saving = true;
    const v = this.form.value;
    const input = {
      ...v,
      horaEntrada: this.withSeconds(v.horaEntrada!),
      horaSalida: this.withSeconds(v.horaSalida!),
    };
    this.empleados.create(input as any).subscribe({
      next: (emp) => {
        this.saving = false;
        this.modalOpen = false;
        this.toast.success('Empleado creado', emp.nombreCompleto);
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.toast.error('No se pudo crear', this.msg(e));
      },
    });
  }

  private withSeconds(t: string): string {
    return t && t.length === 5 ? `${t}:00` : t;
  }

  private msg(e: any): string {
    if (e?.status === 0) return 'Sin conexión con el backend (localhost:8080).';
    return e?.message || 'Error inesperado';
  }
}
