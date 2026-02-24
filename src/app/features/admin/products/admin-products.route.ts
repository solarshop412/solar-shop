import { Routes } from "@angular/router";

export const ADMIN_PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-products.component').then(
            (m) => m.AdminProductsComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
            ),
    }
];