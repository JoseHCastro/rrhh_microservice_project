import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Estado de UI del layout (apertura del sidebar en móvil). */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _navOpen = new BehaviorSubject<boolean>(false);
  readonly navOpen$ = this._navOpen.asObservable();

  toggleNav(): void {
    this._navOpen.next(!this._navOpen.value);
  }
  closeNav(): void {
    this._navOpen.next(false);
  }
}
