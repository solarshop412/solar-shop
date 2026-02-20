import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminGuard } from '../../core/auth/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'kontakti',
        loadComponent: () =>
          import('./contacts/admin-contacts.component').then(
            (m) => m.AdminContactsComponent,
          ),
      },
      {
        path: 'lista-zelja',
        loadComponent: () =>
          import('./wishlist/admin-wishlist.component').then(
            (m) => m.AdminWishlistComponent,
          ),
      },
      {
        path: 'recenzije',
        loadComponent: () =>
          import('./reviews/admin-reviews.component').then(
            (m) => m.AdminReviewsComponent,
          ),
      },
      {
        path: 'email-test',
        loadComponent: () =>
          import('../../shared/components/email-test/email-test.component').then(
            (m) => m.EmailTestComponent,
          ),
      },
      {
        path: 'narudzbe-partneri',
        loadComponent: () =>
          import('./orders-partners/admin-orders-partners.component').then(
            (m) => m.AdminOrdersPartnersComponent,
          ),
      },
      {
        path: 'proizvodi',
        loadChildren: () => 
          import('./products/admin-products.route').then(
            (m) => m.ADMIN_PRODUCTS_ROUTES
          )
      },
      {
        path: 'kategorije',
        loadChildren: () => 
          import('./categories/admin-categories.routes').then(
            (m) => m.ADMIN_CATEGORIES_ROUTES
          )
      },
      {
        path: 'blog',
        loadChildren: () => 
          import('./blog/admin-blog.routes').then(
            (m) => m.ADMIN_BLOG_ROUTES
          )
      },
      {
        path: 'ponude',
        loadChildren: () => 
          import('./offers/admin-offers.routes').then(
            (m) => m.ADMIN_OFFERS_ROUTES
          )
      },
      {
        path: 'korisnici',
        loadChildren: () => 
          import('./users/admin-users-routes').then(
            (m) => m.ADMIN_USERS_ROUTES
          )
      },
      {
        path: 'narudzbe',
        loadChildren: () => 
          import('./orders/admin-orders.routes').then(
            (m) => m.ADMIN_ORDERS_ROUTES
          )
      },
      {
        path: 'cijene-tvrtki',
        loadChildren: () => 
          import('./company-pricing/admin-company-pricing.routes').then(
            (m) => m.ADMIN_COMPANY_PRICING_ROUTES
          )
      },
      {
        path: 'tvrtke',
        loadChildren: () => 
          import('./companies/admin-companies.routes').then(
            (m) => m.ADMIN_COMPANIES_ROUTES          
          )
      }
    ],
  },
];
