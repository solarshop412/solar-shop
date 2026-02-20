import { Routes } from '@angular/router';
import { B2bLayoutComponent } from './shared/layout/b2b-layout.component';
import { AuthGuard } from '../../guards/auth.guard';
import { CompanyApprovedGuard } from '../../guards/company-approved.guard';

export const B2B_ROUTES: Routes = [
  {
    path: '',
    component: B2bLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./partners/partners.component').then(
            (m) => m.PartnersComponent,
          ),
      },
      {
        path: 'o-nama',
        loadComponent: () =>
          import('./partners/about/partners-about.component').then(
            (m) => m.PartnersAboutComponent,
          ),
      },
      {
        path: 'registracija',
        loadComponent: () =>
          import('./partners/register/partners-register.component').then(
            (m) => m.PartnersRegisterComponent,
          ),
      },
      {
        path: 'proizvodi',
        loadComponent: () =>
          import('./partners/products/partners-products/partners-products.component').then(
            (m) => m.PartnersProductsComponent,
          ),
        canActivate: [CompanyApprovedGuard],
      },
      {
        path: 'proizvodi/:id',
        loadComponent: () =>
          import('./partners/products/partners-product-details/partners-product-details.component').then(
            (m) => m.PartnersProductDetailsComponent,
          ),
        canActivate: [CompanyApprovedGuard],
      },
      {
        path: 'ponude',
        loadComponent: () =>
          import('./partners/offers/partners-offers/partners-offers.component').then(
            (m) => m.PartnersOffersComponent,
          ),
        canActivate: [CompanyApprovedGuard],
      },
      {
        path: 'ponude/:id',
        loadComponent: () =>
          import('./partners/offers/partners-offer-details/partners-offer-details.component').then(
            (m) => m.PartnersOfferDetailsComponent,
          ),
        canActivate: [CompanyApprovedGuard],
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./partners/profile/partner-profile.component').then(
            (m) => m.PartnerProfileComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'detalji-narudzbe/:id',
        loadComponent: () =>
          import('./order-details/b2b-order-details.component').then(
            (m) => m.B2bOrderDetailsComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'kontakt',
        loadComponent: () =>
          import('./partners/contact/partners-contact.component').then(
            (m) => m.PartnersContactComponent,
          ),
      },

      // B2B Checkout routes - Lazy loaded
      {
        path: 'blagajna',
        loadComponent: () =>
          import('./checkout/b2b-checkout.component').then(
            (m) => m.B2bCheckoutComponent,
          ),
        canActivate: [CompanyApprovedGuard],
        children: [
          { path: '', redirectTo: 'pregled-narudzbe', pathMatch: 'full' },
          {
            path: 'pregled-narudzbe',
            loadComponent: () =>
              import('./checkout/steps/b2b-order-review/b2b-order-review.component').then(
                (m) => m.B2bOrderReviewComponent,
              ),
          },
          {
            path: 'dostava',
            loadComponent: () =>
              import('./checkout/steps/b2b-shipping/b2b-shipping.component').then(
                (m) => m.B2bShippingComponent,
              ),
          },
          {
            path: 'placanje',
            loadComponent: () =>
              import('./checkout/steps/b2b-payment/b2b-payment.component').then(
                (m) => m.B2bPaymentComponent,
              ),
          },
        ],
      },
    ],
  },
];
