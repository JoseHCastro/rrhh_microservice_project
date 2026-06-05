import { Component } from '@angular/core';

@Component({
  selector: 'app-tokens',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>Dispositivos Vinculados</b></div>
          <h1>Dispositivos Vinculados (Push)</h1>
        </div>
      </div>
      <div class="card">
        <div class="es">
          <div class="esic ci"><app-icon name="smartphone" [size]="24"></app-icon></div>
          <h4>Gestión de tokens push (FCM)</h4>
          <p>
            El backend permite <b>registrar</b> y <b>revocar</b> tokens FCM por dispositivo
            (<code>registrarTokenPush</code> / <code>revocarTokenPush</code>), pero el schema GraphQL
            no expone una consulta para listarlos. El registro ocurre desde la app móvil del empleado.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class TokensComponent {}
