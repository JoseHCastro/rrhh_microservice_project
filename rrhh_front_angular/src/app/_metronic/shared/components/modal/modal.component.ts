import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Modal reutilizable (estilo .mo/.mbox del diseño).
 * Uso: <app-modal [open]="x" title="…" (close)="…" (confirm)="…">contenido</app-modal>
 */
@Component({
  selector: 'app-modal',
  template: `
    <div class="mo" [class.show]="open" (click)="onBackdrop($event)">
      <div class="mbox">
        <div class="mhd">
          <h3>{{ title }}</h3>
          <button class="ibtv" style="border:0;background:none;cursor:pointer" (click)="close.emit()">
            <app-icon name="x" [size]="18" [stroke]="2"></app-icon>
          </button>
        </div>
        <div class="mbd"><ng-content></ng-content></div>
        <div class="mft">
          <button class="btn" (click)="close.emit()">{{ cancelLabel }}</button>
          <button class="btn pri" (click)="confirm.emit()">{{ okLabel }}</button>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() okLabel = 'Guardar';
  @Input() cancelLabel = 'Cancelar';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('mo')) this.close.emit();
  }
}
