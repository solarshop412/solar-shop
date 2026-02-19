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
        path: 'proizvodi',
        loadComponent: () =>
          import('./partners/products/partners-products/partners-products.component').then(
            (m) => m.PartnersProductsComponent,
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
    ],
  },
];
