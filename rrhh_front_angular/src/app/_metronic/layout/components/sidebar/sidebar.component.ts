import { Component } from '@angular/core';
import { LayoutService } from '../../../shared/services/layout.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  // Grupos colapsables; 'org' abierto por defecto.
  open: Record<string, boolean> = { org: true, asis: false, aus: false, nom: false, seg: false };

  constructor(public layout: LayoutService) {}

  toggle(group: string): void {
    this.open[group] = !this.open[group];
  }

  /** Cierra el sidebar en móvil tras navegar. */
  onNavigate(): void {
    if (window.innerWidth <= 1024) this.layout.closeNav();
  }
}
