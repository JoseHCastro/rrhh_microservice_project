import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'tok' | 'terr' | 'twn' | 'tinf';
export interface ToastMsg {
  id: number;
  msg: string;
  sub?: string;
  type: ToastType;
}

/** Notificaciones efímeras (toasts), réplica del sistema del diseño TechVentures. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = new BehaviorSubject<ToastMsg[]>([]);
  readonly toasts$ = this._toasts.asObservable();
  private seq = 0;

  show(msg: string, sub = '', type: ToastType = 'tok'): void {
    const t: ToastMsg = { id: ++this.seq, msg, sub, type };
    this._toasts.next([...this._toasts.value, t]);
    setTimeout(() => this.dismiss(t.id), 3500);
  }
  success(msg: string, sub = ''): void { this.show(msg, sub, 'tok'); }
  error(msg: string, sub = ''): void { this.show(msg, sub, 'terr'); }
  warn(msg: string, sub = ''): void { this.show(msg, sub, 'twn'); }
  info(msg: string, sub = ''): void { this.show(msg, sub, 'tinf'); }

  dismiss(id: number): void {
    this._toasts.next(this._toasts.value.filter((t) => t.id !== id));
  }
}
