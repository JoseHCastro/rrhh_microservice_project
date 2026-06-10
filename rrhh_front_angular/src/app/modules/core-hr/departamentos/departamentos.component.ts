import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { DepartamentoService } from '../services/departamento.service';
import { EmpleadoService } from '../services/empleado.service';
import { Departamento, Empleado } from '../models/rrhh.models';
import * as L from 'leaflet';

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
  selector: 'app-departamentos',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Departamentos</b></div>
          <h1>Departamentos</h1>
        </div>
        <div class="pha">
          <button class="btn pri" (click)="openModal()">
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
            Gerente: {{ d.gerente?.nombreCompleto || 'Sin asignar' }}<br>
            Ubicación: {{ d.ubicacionGps || 'No configurada' }}
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
      <div class="fr one" style="margin-top: 15px;">
        <div class="ff">
          <label>Gerente</label>
          <select [(ngModel)]="gerenteId">
            <option value="">Seleccione un gerente (Opcional)</option>
            <option *ngFor="let emp of empleados" [value]="emp.id">{{ emp.nombreCompleto }}</option>
          </select>
        </div>
      </div>
      <div class="fr one" style="margin-top: 15px;">
        <div class="ff">
          <label>Ubicación GPS <span class="ss">(Haz clic en el mapa)</span></label>
          <input type="text" [(ngModel)]="ubicacionGps" readonly placeholder="-17.783300, -63.182100" style="background:var(--bg2)" />
        </div>
      </div>
      <div class="fr one" style="margin-top: 15px;">
        <div class="ff">
          <div id="map-depto" style="height: 200px; width: 100%; border-radius: 8px; border: 1px solid var(--border); z-index: 1;"></div>
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
  ubicacionGps = '';
  gerenteId = '';
  empleados: Empleado[] = [];

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  constructor(
    private service: DepartamentoService,
    private empleadoService: EmpleadoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getPage(0, 1000, undefined, undefined).subscribe({
      next: (page) => {
        this.empleados = page.content;
      },
      error: (e) => {
        console.error('Error al cargar empleados', e);
        this.toast.error('Error al cargar empleados', '');
      }
    });
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

  openModal(): void {
    this.nombre = '';
    this.ubicacionGps = '';
    this.gerenteId = '';
    this.modalOpen = true;
    setTimeout(() => this.initMap(), 200);
  }

  private initMap(): void {
    const mapContainer = document.getElementById('map-depto');
    if (!mapContainer) return;

    if (this.map) {
      this.map.remove();
    }

    // Centrar en Santa Cruz de la Sierra por defecto
    this.map = L.map('map-depto').setView([-17.783300, -63.182100], 13);
    
    // Forzar el recálculo del tamaño del mapa una vez renderizado
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

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
      this.ubicacionGps = lat + ',' + lng;
    });
  }

  save(): void {
    if (!this.nombre.trim()) {
      this.toast.warn('Ingresa un nombre');
      return;
    }
    this.saving = true;
    this.service.create(this.nombre.trim(), this.ubicacionGps, this.gerenteId).subscribe({
      next: (d) => {
        this.saving = false;
        this.modalOpen = false;
        this.nombre = '';
        this.ubicacionGps = '';
        this.gerenteId = '';
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
