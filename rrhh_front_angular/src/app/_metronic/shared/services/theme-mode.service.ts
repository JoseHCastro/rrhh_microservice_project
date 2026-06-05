import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

/** Gestiona el tema (data-theme en <html>), persistido en localStorage. */
@Injectable({ providedIn: 'root' })
export class ThemeModeService {
  private readonly KEY = 'tv-theme';
  private readonly _mode = new BehaviorSubject<ThemeMode>('light');
  readonly mode$ = this._mode.asObservable();

  init(): void {
    const saved = localStorage.getItem(this.KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.set(saved ?? (prefersDark ? 'dark' : 'light'));
  }

  set(mode: ThemeMode): void {
    this._mode.next(mode);
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(this.KEY, mode);
  }

  toggle(): void {
    this.set(this._mode.value === 'dark' ? 'light' : 'dark');
  }

  get current(): ThemeMode {
    return this._mode.value;
  }
}
