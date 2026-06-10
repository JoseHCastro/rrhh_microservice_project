import { Component } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { BitacoraItem, BitacoraService } from '../services/bitacora.service';

type Modo = 'usuario' | 'archivo';

@Component({
  selector: 'app-auditoria',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Bitácora de Auditoría</b></div>
          <h1>Bitácora de Auditoría</h1>
          <div style="font-size:12.5px;color:var(--tx3);margin-top:6px">
            Registros de acceso a archivos almacenados en DynamoDB (Módulo 3). Consulta puntual
            por usuario o por archivo.
          </div>
        </div>
      </div>

      <!-- Panel de consulta (selector) -->
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
          <div class="ff" style="margin:0">
            <label>Consultar por</label>
            <div style="display:flex;gap:6px;margin-top:2px">
              <button class="ab" [class.vw]="modo === 'usuario'" (click)="setModo('usuario')">
                <app-icon name="shield" [size]="13"></app-icon> Por usuario
              </button>
              <button class="ab" [class.vw]="modo === 'archivo'" (click)="setModo('archivo')">
                <app-icon name="list" [size]="13"></app-icon> Por archivo
              </button>
            </div>
          </div>

          <div class="ff" style="margin:0">
            <label>{{ modo === 'usuario' ? 'ID de usuario' : 'ID de archivo' }}</label>
            <input
              type="number"
              min="1"
              [(ngModel)]="idInput"
              (keyup.enter)="consultar()"
              [placeholder]="modo === 'usuario' ? 'Ej: 1' : 'Ej: 5'"
              style="width:160px"
            />
          </div>

          <div class="ff" style="margin:0">
            <label>Límite</label>
            <select [(ngModel)]="limit" style="width:100px">
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
              <option [ngValue]="100">100</option>
            </select>
          </div>

          <button class="btn" (click)="consultar()" [disabled]="loading || !idInput">
            <app-icon name="list" [size]="15"></app-icon>
            {{ loading ? 'Consultando…' : 'Consultar' }}
          </button>
        </div>
      </div>

      <!-- Resultados -->
      <div class="card">
        <div class="loadc" *ngIf="loading"><div class="spin"></div></div>

        <div class="es" *ngIf="error && !loading">
          <div class="esic cr2"><app-icon name="alert" [size]="24"></app-icon></div>
          <h4>No se pudo consultar la bitácora</h4>
          <p>{{ error }}</p>
          <button class="btn" (click)="consultar()"><app-icon name="refresh" [size]="15"></app-icon> Reintentar</button>
        </div>

        <div class="es" *ngIf="!loading && !error && !consultado">
          <div class="esic ca"><app-icon name="list" [size]="24"></app-icon></div>
          <h4>Sin consulta</h4>
          <p>Elige usuario o archivo, escribe un ID y pulsa <b>Consultar</b>.</p>
        </div>

        <div class="tw" *ngIf="!loading && !error && consultado">
          <div style="font-size:12.5px;color:var(--tx3);padding:10px 14px" *ngIf="items.length">
            {{ items.length }} registro(s)
            <span *ngIf="denegados"> · <span style="color:#dc2626;font-weight:600">{{ denegados }} denegado(s)</span></span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Acción</th>
                <th>Resultado</th>
                <th>Usuario</th>
                <th>Documento</th>
                <th>IP</th>
                <th>Plataforma</th>
                <th>Motivo denegación</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let it of items"
                [style.background]="esDenegado(it) ? 'rgba(220,38,38,0.06)' : null"
              >
                <td class="mn">{{ it.timestamp | date: 'dd MMM y, HH:mm:ss' }}</td>
                <td><span class="mn">{{ it.accion }}</span></td>
                <td>
                  <span
                    class="bst"
                    [class.bok]="!esDenegado(it)"
                    [style.background]="esDenegado(it) ? 'rgba(220,38,38,0.12)' : null"
                    [style.color]="esDenegado(it) ? '#dc2626' : null"
                  >
                    <span class="bd2"></span>{{ it.resultado || (esDenegado(it) ? 'DENEGADO' : 'OK') }}
                  </span>
                </td>
                <td class="mn">{{ it.usuarioId }}</td>
                <td class="mn">
                  <a *ngIf="it.documentoS3Url" [href]="it.documentoS3Url" target="_blank" rel="noopener">
                    #{{ it.documentoS3Id }}
                  </a>
                  <span *ngIf="!it.documentoS3Url">{{ it.documentoS3Id ?? '—' }}</span>
                </td>
                <td class="mn">{{ it.ipOrigen || '—' }}</td>
                <td>
                  <span class="bst bsl" style="font-size:10px;padding:3px 8px">
                    <span class="bd2"></span>{{ it.plataformaOrigen || 'N/D' }}
                  </span>
                </td>
                <td>
                  <span *ngIf="it.motivoDenegacion" style="color:#dc2626;font-size:12px">{{ it.motivoDenegacion }}</span>
                  <span *ngIf="!it.motivoDenegacion" class="mt">—</span>
                </td>
              </tr>
              <tr *ngIf="items.length === 0">
                <td colspan="8">
                  <div class="es">
                    <h4>Sin registros</h4>
                    <p>No hay eventos de auditoría para este {{ modo }} (ID {{ ultimoId }}).</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AuditoriaComponent {
  modo: Modo = 'archivo';
  idInput: number | null = null;
  limit = 50;

  items: BitacoraItem[] = [];
  loading = false;
  error = '';
  consultado = false;
  ultimoId: number | null = null;

  constructor(private service: BitacoraService, private toast: ToastService) {}

  get denegados(): number {
    return this.items.filter((it) => this.esDenegado(it)).length;
  }

  esDenegado(it: BitacoraItem): boolean {
    const r = (it.resultado || '').toUpperCase();
    return r === 'DENEGADO' || r === 'ERROR' || it.accion === 'ACCESO_DENEGADO';
  }

  setModo(m: Modo): void {
    if (this.modo === m) return;
    this.modo = m;
    this.items = [];
    this.consultado = false;
    this.error = '';
  }

  consultar(): void {
    const id = this.idInput;
    if (id == null || id <= 0) {
      this.toast.error('ID inválido', 'Escribe un ID numérico mayor que 0.');
      return;
    }
    this.loading = true;
    this.error = '';
    this.ultimoId = id;
    const obs =
      this.modo === 'usuario'
        ? this.service.porUsuario(id, this.limit)
        : this.service.porArchivo(id, this.limit);

    obs.subscribe({
      next: (rows) => {
        this.items = rows;
        this.loading = false;
        this.consultado = true;
      },
      error: (e) => {
        this.loading = false;
        this.consultado = false;
        this.error =
          e?.status === 0
            ? 'Sin conexión con el backend de bitácora (Nest, localhost:3000). ¿Está levantado?'
            : e?.message || 'Error consultando la bitácora.';
      },
    });
  }
}
