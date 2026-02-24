import { Routes } from "@angular/router";

export const ADMIN_USERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-users.component').then(
            (m) => m.AdminUsersComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent,
            ),
    },
];