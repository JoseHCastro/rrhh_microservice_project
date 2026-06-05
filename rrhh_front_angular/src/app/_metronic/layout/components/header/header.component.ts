import { Component, HostListener } from '@angular/core';
import { ThemeModeService } from '../../../shared/services/theme-mode.service';
import { LayoutService } from '../../../shared/services/layout.service';
import { AuthService } from '../../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  pop: 'nb' | 'prof' | null = null;

  constructor(
    public theme: ThemeModeService,
    public layout: LayoutService,
    public auth: AuthService
  ) {}

  togglePop(p: 'nb' | 'prof', e: MouseEvent): void {
    e.stopPropagation();
    this.pop = this.pop === p ? null : p;
  }

  @HostListener('document:click')
  closePops(): void {
    this.pop = null;
  }

  get initials(): string {
    const u = this.auth.currentUser?.username || 'AG';
    return u.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'AG';
  }

  logout(): void {
    this.pop = null;
    this.auth.logout();
  }
}
