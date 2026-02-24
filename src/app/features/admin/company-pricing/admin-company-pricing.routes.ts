import { Routes } from "@angular/router";

export const ADMIN_COMPANY_PRICING_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-company-pricing.component').then(
            (m) => m.AdminCompanyPricingComponent,
            ),
        },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./company-pricing-form/company-pricing-form.component').then(
            (m) => m.CompanyPricingFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
            loadComponent: () =>
                import('./company-pricing-form/company-pricing-form.component').then(
                (m) => m.CompanyPricingFormComponent,
                ),
    },
    {
        path: 'detalji/:id',
            loadComponent: () =>
                import('./company-pricing-form/company-pricing-form.component').then(
                (m) => m.CompanyPricingFormComponent,
                ),
    },
];