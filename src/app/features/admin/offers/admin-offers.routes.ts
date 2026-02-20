import { Routes } from "@angular/router";

export const ADMIN_OFFERS_ROUTES: Routes = [
    {
        path: 'ponude',
        loadComponent: () =>
            import('./admin-offers.component').then(
            (m) => m.AdminOffersComponent,
            ),
    },
    {
        path: 'ponude/kreiraj',
        loadComponent: () =>
            import('./offer-form/offer-form.component').then(
            (m) => m.OfferFormComponent,
            ),
    },
    {
        path: 'ponude/uredi/:id',
        loadComponent: () =>
            import('./offer-form/offer-form.component').then(
            (m) => m.OfferFormComponent,
            ),
    },
    {
        path: 'ponude/detalji/:id',
        loadComponent: () =>
            import('./offer-details/offer-details.component').then(
            (m) => m.OfferDetailsComponent,
            ),
    },
];