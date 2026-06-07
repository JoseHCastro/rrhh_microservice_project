import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToastService } from '../../../_metronic/shared/services/toast.service';
import { AsistenciaService } from '../services/asistencia.service';
import { EmpleadoService } from '../services/empleado.service';
import { Empleado } from '../models/rrhh.models';

// face-api.js se usa vía la variable global window.faceapi cargada por el script en index.html
declare const faceapi: any;

@Component({
  selector: 'app-reconocimiento',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Reconocimiento Biométrico</b></div>
          <h1>Reconocimiento Biométrico</h1>
        </div>
      </div>

      <div class="card" style="max-width:620px">
        <div class="chd">
          <div class="chl">
            <div class="chi ci"><app-icon name="scanFace" [size]="17"></app-icon></div>
            <div><h3>Enrolar rostro</h3><div class="chs">Vincula el rostro biométrico a un empleado</div></div>
          </div>
        </div>
        <div style="padding:18px">

          <!-- Selector de empleado -->
          <div class="fr one" style="margin-bottom:16px">
            <div class="ff">
              <label>Empleado *</label>
              <select [(ngModel)]="empleadoId" (change)="onEmpleadoChange()">
                <option value="">Seleccionar…</option>
                <option *ngFor="let e of empleados" [value]="e.id">{{ e.nombreCompleto }}</option>
              </select>
            </div>
          </div>

          <!-- Estado de enrolamiento previo -->
          <div *ngIf="enrolamientoPrevio" style="padding:8px 12px; background:#e8f4fd; border-radius:6px; margin-bottom:12px; font-size:13px; color:#0c5d9e">
            ✓ Este empleado ya tiene rostro enrolado. Puedes reemplazarlo.
          </div>

          <!-- Área de la cámara -->
          <div *ngIf="empleadoId" style="margin-bottom:16px; text-align:center;">
            <div style="position:relative; display:inline-block; border-radius:12px; overflow:hidden; border:2px solid #ddd; background:#000;">
              <video #videoEl autoplay muted playsinline
                [style.display]="camaraActiva ? 'block' : 'none'"
                style="width:400px; height:300px; display:block; object-fit:cover;">
              </video>
              <canvas #canvasEl style="position:absolute; top:0; left:0; width:400px; height:300px;"></canvas>
              <div *ngIf="!camaraActiva"
                style="width:400px; height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#999; gap:8px;">
                <app-icon name="scanFace" [size]="48"></app-icon>
                <span>Haz clic en "Activar cámara"</span>
              </div>
              <!-- Estado de detección -->
              <div *ngIf="camaraActiva && !rostroDetectado"
                style="position:absolute; top:8px; right:8px; background:rgba(255,165,0,0.85); color:#fff; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600;">
                Buscando rostro…
              </div>
              <div *ngIf="rostroDetectado"
                style="position:absolute; top:8px; right:8px; background:rgba(34,197,94,0.9); color:#fff; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600;">
                ✓ Rostro detectado
              </div>
            </div>

            <!-- Controles -->
            <div style="margin-top:12px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
              <button class="btn" *ngIf="!camaraActiva" (click)="activarCamara()" [disabled]="cargandoModelos">
                <app-icon name="camera" [size]="15"></app-icon>
                {{ cargandoModelos ? 'Cargando IA…' : 'Activar cámara' }}
              </button>
              <button class="btn" *ngIf="camaraActiva" (click)="detenerCamara()" style="background:#e5e7eb; color:#374151;">
                <app-icon name="x" [size]="15"></app-icon> Detener cámara
              </button>
              <button class="btn pri" *ngIf="rostroDetectado" (click)="enrolar()" [disabled]="saving">
                <app-icon name="scanFace" [size]="15"></app-icon>
                {{ saving ? 'Enrolando…' : 'Enrolar rostro' }}
              </button>
            </div>
          </div>

          <div *ngIf="!empleadoId" style="text-align:center; color:#999; padding:24px;">
            Selecciona un empleado para iniciar el proceso de enrolamiento.
          </div>
        </div>
        <div class="tft"><span>face-api.js · TinyFaceDetector + FaceRecognitionNet · FastAPI port 8001</span></div>
      </div>
    </div>
  `,
})
export class ReconocimientoComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;

  empleados: Empleado[] = [];
  empleadoId = '';
  saving = false;
  camaraActiva = false;
  cargandoModelos = false;
  rostroDetectado = false;
  enrolamientoPrevio: any = null;

  private stream: MediaStream | null = null;
  private deteccionInterval: any = null;
  private modelosCargados = false;

  constructor(
    private service: AsistenciaService,
    private empleadoSvc: EmpleadoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.empleadoSvc.getPage(0, 200).subscribe({ next: (p) => (this.empleados = p.content), error: () => {} });
    this.precargarModelos();
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  async precargarModelos(): Promise<void> {
    if (this.modelosCargados || typeof faceapi === 'undefined') return;
    this.cargandoModelos = true;
    try {
      const MODEL_URL = '/assets/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      this.modelosCargados = true;
    } catch (e) {
      console.warn('Modelos no cargados aún:', e);
    } finally {
      this.cargandoModelos = false;
    }
  }

  onEmpleadoChange(): void {
    this.detenerCamara();
    this.enrolamientoPrevio = null;
    if (!this.empleadoId) return;
    this.service.verificarEnrolamiento(this.empleadoId).subscribe({
      next: (r) => { this.enrolamientoPrevio = r; },
      error: () => {}
    });
  }

  async activarCamara(): Promise<void> {
    if (typeof faceapi === 'undefined') {
      this.toast.warn('La librería de reconocimiento facial no está lista. Recarga la página.');
      return;
    }
    if (!this.modelosCargados) {
      await this.precargarModelos();
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300, facingMode: 'user' }
      });
      setTimeout(() => {
        const video = this.videoRef?.nativeElement;
        if (video) {
          video.srcObject = this.stream;
          this.camaraActiva = true;
          this.iniciarDeteccion();
        }
      }, 150);
    } catch (e: any) {
      this.toast.error('No se pudo acceder a la cámara', e?.message || 'Verifica los permisos del navegador');
    }
  }

  detenerCamara(): void {
    clearInterval(this.deteccionInterval);
    this.deteccionInterval = null;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.camaraActiva = false;
    this.rostroDetectado = false;
  }

  iniciarDeteccion(): void {
    this.deteccionInterval = setInterval(async () => {
      const video = this.videoRef?.nativeElement;
      if (!video || video.readyState < 2) return;
      try {
        const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
        this.rostroDetectado = !!det;
        const canvas = this.canvasRef?.nativeElement;
        if (canvas) {
          const dims = faceapi.matchDimensions(canvas, { width: 400, height: 300 }, true);
          faceapi.draw.drawDetections(canvas, det ? [faceapi.resizeResults(det, dims)] : []);
        }
      } catch {}
    }, 400);
  }

  async enrolar(): Promise<void> {
    if (!this.empleadoId) { this.toast.warn('Selecciona un empleado'); return; }
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    this.saving = true;
    try {
      // Capturar fotograma en base64
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);

      this.service.enrolarRostro(this.empleadoId, fotoBase64).subscribe({
        next: (res: any) => {
          this.saving = false;
          if (res.success) {
            this.toast.success('Rostro enrolado', res.message);
            this.detenerCamara();
            this.empleadoId = '';
            this.enrolamientoPrevio = null;
          } else {
            this.toast.error('Error al enrolar', res.message);
          }
        },
        error: (e: any) => {
          this.saving = false;
          this.toast.error('Error de conexión', e?.message || 'No se pudo conectar con FastAPI');
        },
      });
    } catch (e: any) {
      this.saving = false;
      this.toast.error('Error al procesar el rostro', e?.message || '');
    }
  }
}
