import { Routes } from "@angular/router";

export const ADMIN_COMPANIES_ROUTES: Routes = [
    {
        path: 'tvrtke',
        loadComponent: () =>
            import('./admin-companies/admin-companies.component').then(
            (m) => m.AdminCompaniesComponent,
            ),
    },
    {
        path: 'tvrtke/kreiraj',
        loadComponent: () =>
            import('./admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
            ),
    },
    {
        path: 'tvrtke/uredi/:id',
        loadComponent: () =>
            import('./admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
            ),
    },
    {
        path: 'tvrtke/detalji/:id',
        loadComponent: () =>
            import('./admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
            ),
    },

];