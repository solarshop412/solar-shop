import { Routes } from "@angular/router";

export const ADMIN_OFFERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-offers.component').then(
            (m) => m.AdminOffersComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./offer-form/offer-form.component').then(
            (m) => m.OfferFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./offer-form/offer-form.component').then(
            (m) => m.OfferFormComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./offer-details/offer-details.component').then(
            (m) => m.OfferDetailsComponent,
            ),
    },
];