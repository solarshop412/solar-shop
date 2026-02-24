import { Routes } from "@angular/router";

export const ADMIN_ORDERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-orders.component').then(
            (m) => m.AdminOrdersComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./order-form/order-form.component').then(
            (m) => m.OrderFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./order-form/order-form.component').then(
            (m) => m.OrderFormComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent,
            ),
    },
];