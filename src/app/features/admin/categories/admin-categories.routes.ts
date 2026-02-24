import { Routes } from "@angular/router";

export const ADMIN_CATEGORIES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-categories.component').then(
            (m) => m.AdminCategoriesComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
            ),
    },
];