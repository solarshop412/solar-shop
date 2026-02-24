import { Routes } from "@angular/router";

export const ADMIN_COMPANIES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-companies/admin-companies.component').then(
            (m) => m.AdminCompaniesComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
            ),
    },

];