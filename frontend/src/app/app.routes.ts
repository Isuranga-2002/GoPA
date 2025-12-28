import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing/landing').then(m => m.Landing) },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    children: [
      { path: 'results', loadComponent: () => import('./dashboard/results/results').then(m => m.Results) },
      { path: 'year-wise-gpa', loadComponent: () => import('./dashboard/year-wise-gpa/year-wise-gpa').then(m => m.YearWiseGpa) },
      { path: 'cumulative-gpa', loadComponent: () => import('./dashboard/cumulative-gpa/cumulative-gpa').then(m => m.CumulativeGpa) },
      { path: 'repeats', loadComponent: () => import('./dashboard/repeats/repeats').then(m => m.Repeats) }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];

export const appRouterProviders = [provideRouter(routes)];
