import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Ana Sayfa - KuaförBul'
  },
  {
    path: 'barbers',
    loadComponent: () => import('./features/barbers/barber-list/barber-list.component').then(m => m.BarberListComponent),
    title: 'Kuaförler - KuaförBul'
  },
  {
    path: 'barbers/:id',
    loadComponent: () => import('./features/barbers/barber-detail/barber-detail.component').then(m => m.BarberDetailComponent),
    title: 'Kuaför Detay - KuaförBul'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Giriş Yap - KuaförBul'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Kayıt Ol - KuaförBul'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
