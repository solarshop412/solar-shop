import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/b2c/b2c.routes').then((m) => m.B2C_ROUTES),
    data: { preload: true }
  },
  {
    path: 'partneri',
    loadChildren: () =>
      import('./features/b2b/b2b.routes').then((m) => m.B2B_ROUTES),
    data: { preload: false }
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    data: { preload: false }
  },
  {
    path: '',
    loadChildren: () =>
      import('./core/auth/app.routes').then((m) => m.AUTH_ROUTES),
    data: { preload: false }
  },
  { path: '**', redirectTo: '' },
];
