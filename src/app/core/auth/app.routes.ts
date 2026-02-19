import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'prijava',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'registracija',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'zaboravljena-lozinka',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-lozinka',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'confirm',
    loadComponent: () =>
      import('./components/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent,
      ),
  },
  {
    path: 'potvrda',
    loadComponent: () =>
      import('./components/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
];
