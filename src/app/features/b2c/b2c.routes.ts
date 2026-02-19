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
      },
    ],
  },
];
