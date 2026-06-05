import { Component } from '@angular/core';

@Component({
  selector: 'app-auditoria',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Bitácora de Auditoría</b></div>
          <h1>Bitácora de Auditoría</h1>
        </div>
      </div>
      <div class="card">
        <div class="es">
          <div class="esic ca"><app-icon name="list" [size]="24"></app-icon></div>
          <h4>Bitácora en DynamoDB</h4>
          <p>
            La auditoría del sistema se almacena en DynamoDB (tabla <code>rrhh_bitacora</code>) y
            actualmente no está expuesta a través del API GraphQL. Cuando el backend publique una
            query de bitácora, esta vista la consumirá directamente.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class AuditoriaComponent {}
