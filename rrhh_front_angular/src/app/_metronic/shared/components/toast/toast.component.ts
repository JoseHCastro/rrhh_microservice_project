import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div id="tc">
      <div *ngFor="let t of toast.toasts$ | async" class="tst {{ t.type }}" (click)="toast.dismiss(t.id)">
        <div class="tdot"></div>
        <div>
          <div class="tmsg">{{ t.msg }}</div>
          <div class="tsub" *ngIf="t.sub">{{ t.sub }}</div>
        </div>
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
