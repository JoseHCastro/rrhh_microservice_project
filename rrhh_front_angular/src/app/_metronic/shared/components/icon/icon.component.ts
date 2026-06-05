import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS } from './icons';

/**
 * <app-icon name="users" [size]="18" [stroke]="1.85"></app-icon>
 * Renderiza un SVG del registro ICONS. UI genérica (sin negocio).
 */
@Component({
  selector: 'app-icon',
  template: `<span class="ico-host" [innerHTML]="html"></span>`,
  styles: [':host{display:inline-flex;line-height:0}.ico-host{display:inline-flex;line-height:0}'],
})
export class IconComponent {
  private _name = '';
  private _size = 18;
  private _stroke = 1.85;
  html: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  @Input() set name(v: string) { this._name = v; this.build(); }
  @Input() set size(v: number) { this._size = v; this.build(); }
  @Input() set stroke(v: number) { this._stroke = v; this.build(); }

  private build(): void {
    const inner = ICONS[this._name] || '';
    const svg =
      `<svg class="ic" width="${this._size}" height="${this._size}" viewBox="0 0 24 24" ` +
      `fill="none" stroke="currentColor" stroke-width="${this._stroke}" ` +
      `stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    this.html = this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
