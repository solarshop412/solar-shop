import { Routes } from '@angular/router';
import { PageLayoutComponent } from '../../core/page-layout/page-layout.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from '../../guards/auth.guard';

export const B2C_ROUTES: Routes = [
  {
    path: '',
    component: PageLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'proizvodi',
        loadComponent: () =>
          import('./products/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'proizvodi/:id',
        loadComponent: () =>
          import('./products/product-details/product-details.component').then(
            (m) => m.ProductDetailsComponent,
          ),
      },
      {
        path: 'ponude',
        loadComponent: () =>
          import('./offers/offers-page/offers-page.component').then(
            (m) => m.OffersPageComponent,
          ),
      },
      {
        path: 'ponude/:id',
        loadComponent: () =>
          import('./offers/offer-details/offer-details.component').then(
            (m) => m.OfferDetailsComponent,
          ),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'blagajna',
        loadComponent: () =>
          import('./checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
        children: [
          { path: '', redirectTo: 'pregled-narudzbe', pathMatch: 'full' },
          {
            path: 'pregled-narudzbe',
            loadComponent: () =>
              import('./checkout/steps/order-review/order-review.component').then(
                (m) => m.OrderReviewComponent,
              ),
          },
          {
            path: 'dostava',
            loadComponent: () =>
              import('./checkout/steps/shipping/shipping.component').then(
                (m) => m.ShippingComponent,
              ),
          },
          {
            path: 'placanje',
            loadComponent: () =>
              import('./checkout/steps/payment/payment.component').then(
                (m) => m.PaymentComponent,
              ),
          },
        ],
      },
      {
        path: 'payment-callback',
        loadComponent: () =>
          import('./checkout/payment-callback/payment-callback.component').then(
            (m) => m.PaymentCallbackComponent,
          ),
      },
      {
        path: 'order-confirmation',
        loadComponent: () =>
          import('./order-confirmation/order-confirmation.component').then(
            (m) => m.OrderConfirmationComponent,
          ),
      },
      {
        path: 'detalji-narudzbe/:id',
        loadComponent: () =>
          import('./order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'novosti',
        loadComponent: () =>
          import('./blog/blog.component').then(
            (m) => m.BlogComponent,
          ),
      },
      {
        path: 'novosti/:id',
        loadComponent: () =>
          import('./blog/blog-detail/blog-detail.component').then(
            (m) => m.BlogDetailComponent,
          ),
      },
      {
        path: 'onama',
        loadComponent: () =>
          import('./company/company.component').then(
            (m) => m.CompanyComponent,
          ),
      },
      {
        path: 'kontakt',
        loadComponent: () =>
          import('./contact/contact.component').then(
            (m) => m.ContactComponent,
          ),
      },
      {
        path: 'privatnost',
        loadComponent: () =>
          import('./privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent,
          ),
      },
      {
        path: 'uvjeti',
        loadComponent: () =>
          import('./terms-of-service/terms-of-service.component').then(
            (m) => m.TermsOfServiceComponent,
          ),
      },
      {
        path: 'kolacici',
        loadComponent: () =>
          import('./cookie-policy/cookie-policy.component').then(
            (m) => m.CookiePolicyComponent,
          ),
      },
      {
        path: 'sigurnost-kupovine',
        loadComponent: () =>
          import('./safety-payment/safety-payment.component').then(
            (m) => m.SafetyPaymentComponent,
          ),
      },
      {
        path: 'reklamacije',
        loadComponent: () =>
          import('./complaints/complaints.component').then(
            (m) => m.ComplaintsComponent
          )
      }
    ],
  },
];
