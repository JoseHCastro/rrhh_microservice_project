import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_metronic/layout/layout/layout.component';
import { authGuard } from './_metronic/shared/guards/auth.guard';

const routes: Routes = [
  // Zona pública: módulo Auth (lazy).
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },

  // Zona protegida: shell LayoutComponent + authGuard.
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      // Core HR + stubs de las demás secciones (lazy).
      {
        path: '',
        loadChildren: () =>
          import('./modules/core-hr/core-hr.module').then((m) => m.CoreHrModule),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
