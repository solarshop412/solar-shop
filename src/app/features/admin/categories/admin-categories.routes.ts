import { Routes } from "@angular/router";

export const ADMIN_CATEGORIES_ROUTES: Routes = [
    {
        path: 'kategorije',
        loadComponent: () =>
            import('./admin-categories.component').then(
            (m) => m.AdminCategoriesComponent,
            ),
    },
    {
        path: 'kategorije/kreiraj',
        loadComponent: () =>
            import('./category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
            ),
    },
    {
        path: 'kategorije/uredi/:id',
        loadComponent: () =>
            import('./category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
            ),
    },
    {
        path: 'kategorije/detalji/:id',
        loadComponent: () =>
            import('./category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
            ),
    },
];