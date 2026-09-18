import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'apostas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/apostas/apostas.component').then(m => m.ApostasComponent)
  },
  {
    path: 'estatisticas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/estatisticas/estatisticas.component').then(m => m.EstatisticasComponent)
  },
  {
    path: 'banca',
    canActivate: [authGuard],
    loadComponent: () => import('./features/banca/banca.component').then(m => m.BancaComponent)
  },
  {
    path: 'catalogo',
    canActivate: [authGuard],
    loadComponent: () => import('./features/catalogo/catalogo.component').then(m => m.CatalogoComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
