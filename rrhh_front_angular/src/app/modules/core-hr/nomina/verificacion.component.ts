import { Component } from '@angular/core';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';

@Component({
  selector: 'app-verificacion',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> Preplanillas Mensuales <span class="sl">/</span> <b>Verificación Criptográfica</b></div>
          <h1>Verificador de Documentos</h1>
          <p style="color:#64748b; margin-top: 5px; font-size: 14px;">Sube un PDF generado por el sistema para validar su autenticidad mediante la firma SHA-256.</p>
        </div>
      </div>

      <div class="card" style="padding: 30px; text-align: center; cursor: pointer;" 
           (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <input type="file" #fileInput style="display:none" accept="application/pdf" (change)="onFileSelected($event)">
        
        <div style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px; transition: background 0.2s;"
             onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
          <app-icon name="fileText" [size]="48" style="color: #3b82f6; display: block; margin: 0 auto 15px auto;"></app-icon>
          <h3 style="margin-bottom: 8px;">Selecciona o arrastra el PDF aquí</h3>
          <p style="color:#64748b; font-size: 13px;">El archivo se procesará en tu dispositivo. No se sube a ningún servidor.</p>
        </div>
      </div>

      <!-- Loading state -->
      <div class="card" style="margin-top: 20px; padding: 30px; text-align: center;" *ngIf="loading">
        <div class="spin" style="margin: 0 auto 15px auto;"></div>
        <h4 style="color:#3b82f6;">Calculando hash y verificando...</h4>
      </div>

      <!-- Valid state -->
      <div class="card" style="margin-top: 20px; padding: 30px; border-left: 4px solid #22c55e; background-color: #f0fdf4;" *ngIf="resultado === 'VALIDO' && preplanilla">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
           <app-icon name="checkCircle" [size]="32" style="color: #22c55e; margin-right: 12px;"></app-icon>
           <h2 style="color: #166534; margin: 0;">¡Documento Genuino y Válido!</h2>
        </div>
        <p style="color: #15803d; margin-bottom: 20px;">La firma criptográfica del archivo coincide con un documento registrado oficialmente.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; text-align: left;">
          <h4 style="margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Detalles del Registro Oficial</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div><span style="color:#64748b">Pertenece a:</span><br><b>{{ preplanilla.empleado?.nombreCompleto }}</b></div>
            <div><span style="color:#64748b">Carnet Identidad:</span><br><b>{{ preplanilla.empleado?.carnetIdentidad || 'N/A' }}</b></div>
            <div><span style="color:#64748b">Periodo:</span><br><b>{{ preplanilla.periodo }}</b></div>
            <div><span style="color:#64748b">Fecha de Generación:</span><br><b>{{ preplanilla.fechaCreacion | date:'medium' }}</b></div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; word-break: break-all;">
            <strong>Firma Criptográfica SHA-256 Validada:</strong><br>{{ hashCalculado }}
          </div>
          <div style="margin-top: 15px; text-align: center;" *ngIf="preplanilla?.blockchainTx">
            <a [href]="'https://amoy.polygonscan.com/tx/' + preplanilla.blockchainTx" target="_blank" 
               class="btn pri" style="text-decoration: none; padding: 6px 15px; font-size: 13px; display: inline-flex; align-items: center;">
              <span style="margin-right: 5px;">🛡️</span> Ver Transacción en PolygonScan
            </a>
          </div>
        </div>
      </div>

      <!-- Invalid state -->
      <div class="card" style="margin-top: 20px; padding: 30px; border-left: 4px solid #ef4444; background-color: #fef2f2;" *ngIf="resultado === 'INVALIDO'">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
           <app-icon name="alert" [size]="32" style="color: #ef4444; margin-right: 12px;"></app-icon>
           <h2 style="color: #991b1b; margin: 0;">¡Documento Alterado o Falso!</h2>
        </div>
        <p style="color: #b91c1c; margin-bottom: 20px; text-align: left;">La firma criptográfica de este archivo no existe en el sistema o el archivo ha sido modificado posterior a su generación oficial.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; text-align: left;">
          <div style="font-size: 12px; color: #64748b; word-break: break-all;">
            <strong>Firma Criptográfica SHA-256 Calculada:</strong><br>{{ hashCalculado }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerificacionComponent {
  loading = false;
  resultado: 'VALIDO' | 'INVALIDO' | null = null;
  hashCalculado: string | null = null;
  preplanilla: any = null;

  constructor(private gql: GraphqlService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.procesarArchivo(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.procesarArchivo(event.target.files[0]);
    }
  }

  async procesarArchivo(file: File) {
    this.loading = true;
    this.resultado = null;
    this.preplanilla = null;
    this.hashCalculado = null;

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      this.hashCalculado = hashHex;
      
      // Consultar al backend vía GraphQL
      this.gql.query<{ verificarPreplanilla: any }>(
        `query VerificarPreplanilla($hashDocumento: String!) {
          verificarPreplanilla(hashDocumento: $hashDocumento) {
            id
            periodo
            fechaCreacion
            blockchainTx
            empleado {
              nombreCompleto
              carnetIdentidad
            }
          }
        }`,
        { hashDocumento: hashHex }
      ).subscribe({
        next: (result) => {
          this.loading = false;
          this.resultado = 'VALIDO';
          this.preplanilla = result.verificarPreplanilla;
        },
        error: (error: any) => {
          this.loading = false;
          this.resultado = 'INVALIDO';
          console.error('Error verificando:', error);
        }
      });
      
    } catch (error: any) {
      console.error('Error calculando hash', error);
      this.loading = false;
    }
  }
}
