import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CargoService } from '../services/cargo.service';
import { DepartamentoService } from '../services/departamento.service';
import { EmpleadoService } from '../services/empleado.service';
import { Cargo, Departamento, Empleado, EmpleadoPage, EstadoEmpleado } from '../models/rrhh.models';
import * as L from 'leaflet';

// Fix for leaflet marker icons
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

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
  
  riesgos: { [empleadoId: string]: { riesgo: number; mensaje: string } } = {};
  cargandoRiesgos = false;

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
    fechaNacimiento: [''],
    genero: [''],
    ubicacionHogarGps: [''],
  });

  readonly EstadoEmpleado = EstadoEmpleado;

  constructor(
    private empleados: EmpleadoService,
    private deptos: DepartamentoService,
    private cargoSvc: CargoService,
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private http: HttpClient
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
        this.loadRiesgos();
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

  loadRiesgos(): void {
    this.cargandoRiesgos = true;
    const body = {
      query: `query { obtenerPrediccionRiesgo { empleadoId riesgoAusentismo mensaje } }`
    };
    this.http.post<any>(environment.fastapiGql, body).subscribe({
      next: (res) => {
        this.cargandoRiesgos = false;
        if (res.data?.obtenerPrediccionRiesgo) {
          res.data.obtenerPrediccionRiesgo.forEach((r: any) => {
            this.riesgos[r.empleadoId.toString()] = { riesgo: r.riesgoAusentismo, mensaje: r.mensaje };
          });
        }
      },
      error: () => {
        this.cargandoRiesgos = false;
      }
    });
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
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

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
      fechaNacimiento: '',
      genero: '',
      ubicacionHogarGps: '',
    });
    this.modalOpen = true;
    setTimeout(() => this.initMap(), 200);
  }

  private initMap(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (this.map) {
      this.map.remove();
    }

    // Centrar en Santa Cruz de la Sierra por defecto
    this.map = L.map('map').setView([-17.783300, -63.182100], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      
      if (this.marker && this.map) {
        this.map.removeLayer(this.marker);
      }
      
      this.marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map!);
      this.form.patchValue({ ubicacionHogarGps: `${lat},${lng}` });
    });
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
