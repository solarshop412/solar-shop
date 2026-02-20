import { Routes } from "@angular/router";

export const ADMIN_COMPANY_PRICING_ROUTES: Routes = [
    {
        path: 'cijene-tvrtki',
        loadComponent: () =>
            import('./admin-company-pricing.component').then(
            (m) => m.AdminCompanyPricingComponent,
            ),
        },
    {
        path: 'cijene-tvrtki/kreiraj',
        loadComponent: () =>
            import('./company-pricing-form/company-pricing-form.component').then(
            (m) => m.CompanyPricingFormComponent,
            ),
    },
    {
        path: 'cijene-tvrtki/uredi/:id',
            loadComponent: () =>
                import('./company-pricing-form/company-pricing-form.component').then(
                (m) => m.CompanyPricingFormComponent,
                ),
    },
    {
        path: 'cijene-tvrtki/detalji/:id',
            loadComponent: () =>
                import('./company-pricing-form/company-pricing-form.component').then(
                (m) => m.CompanyPricingFormComponent,
                ),
    },
];