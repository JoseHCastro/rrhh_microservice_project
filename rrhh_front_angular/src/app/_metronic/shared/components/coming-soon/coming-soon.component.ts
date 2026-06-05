import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Placeholder para las secciones aún no implementadas (stubs ruteados). */
@Component({
  selector: 'app-coming-soon',
  template: `
    <div class="cnt">
      <div class="ph">
        <div>
          <div class="crumb">Inicio <span class="sl">/</span> <b>{{ title }}</b></div>
          <h1>{{ title }}</h1>
        </div>
      </div>
      <div class="card">
        <div class="es">
          <div class="esic ci"><app-icon name="cube" [size]="24"></app-icon></div>
          <h4>Módulo en construcción</h4>
          <p>
            La sección «{{ title }}» se implementará en la siguiente fase. El contrato
            GraphQL de esta área ya está disponible en el backend.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ComingSoonComponent {
  title = 'Sección';
  constructor(route: ActivatedRoute) {
    route.data.subscribe((d) => (this.title = d['title'] || 'Sección'));
  }
}
