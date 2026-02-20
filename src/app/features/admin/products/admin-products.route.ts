import { Routes } from "@angular/router";

export const ADMIN_PRODUCTS_ROUTES: Routes = [
    {
        path: 'proizvodi',
        loadComponent: () =>
            import('./admin-products.component').then(
            (m) => m.AdminProductsComponent,
            ),
    },
    {
        path: 'proizvodi/kreiraj',
        loadComponent: () =>
            import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
            ),
    },
    {
        path: 'proizvodi/uredi/:id',
        loadComponent: () =>
            import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
            ),
    },
    {
        path: 'proizvodi/detalji/:id',
        loadComponent: () =>
            import('./product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
            ),
    }
];