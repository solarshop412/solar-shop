import { Routes } from "@angular/router";

export const ADMIN_USERS_ROUTES: Routes = [
    {
        path: 'korisnici',
        loadComponent: () =>
            import('./admin-users.component').then(
            (m) => m.AdminUsersComponent,
            ),
    },
    {
        path: 'korisnici/kreiraj',
        loadComponent: () =>
            import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent,
            ),
    },
    {
        path: 'korisnici/uredi/:id',
        loadComponent: () =>
            import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent,
            ),
    },
    {
        path: 'korisnici/detalji/:id',
        loadComponent: () =>
            import('./user-form/user-form.component').then(
            (m) => m.UserFormComponent,
            ),
    },
];