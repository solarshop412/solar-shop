import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminGuard } from '../../core/auth/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'admin',
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

      // Products
      {
        path: 'proizvodi',
        loadComponent: () =>
          import('./products/admin-products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'proizvodi/kreiraj',
        loadComponent: () =>
          import('./products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'proizvodi/uredi/:id',
        loadComponent: () =>
          import('./products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'proizvodi/detalji/:id',
        loadComponent: () =>
          import('./products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },

      // Categories
      {
        path: 'kategorije',
        loadComponent: () =>
          import('./categories/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'kategorije/kreiraj',
        loadComponent: () =>
          import('./categories/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'kategorije/uredi/:id',
        loadComponent: () =>
          import('./categories/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'kategorije/detalji/:id',
        loadComponent: () =>
          import('./categories/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },

      // Blog
      {
        path: 'blog',
        loadComponent: () =>
          import('./blog/admin-blog.component').then(
            (m) => m.AdminBlogComponent,
          ),
      },
      {
        path: 'blog/kreiraj',
        loadComponent: () =>
          import('./blog/blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
          ),
      },
      {
        path: 'blog/uredi/:id',
        loadComponent: () =>
          import('./blog/blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
          ),
      },
      {
        path: 'blog/detalji/:id',
        loadComponent: () =>
          import('./blog/blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
          ),
      },

      // Offers
      {
        path: 'ponude',
        loadComponent: () =>
          import('./offers/admin-offers.component').then(
            (m) => m.AdminOffersComponent,
          ),
      },
      {
        path: 'ponude/kreiraj',
        loadComponent: () =>
          import('./offers/offer-form/offer-form.component').then(
            (m) => m.OfferFormComponent,
          ),
      },
      {
        path: 'ponude/uredi/:id',
        loadComponent: () =>
          import('./offers/offer-form/offer-form.component').then(
            (m) => m.OfferFormComponent,
          ),
      },
      {
        path: 'ponude/detalji/:id',
        loadComponent: () =>
          import('./offers/offer-details/offer-details.component').then(
            (m) => m.OfferDetailsComponent,
          ),
      },

      // Users
      {
        path: 'korisnici',
        loadComponent: () =>
          import('./users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'korisnici/kreiraj',
        loadComponent: () =>
          import('./users/user-form/user-form.component').then(
            (m) => m.UserFormComponent,
          ),
      },
      {
        path: 'korisnici/uredi/:id',
        loadComponent: () =>
          import('./users/user-form/user-form.component').then(
            (m) => m.UserFormComponent,
          ),
      },
      {
        path: 'korisnici/detalji/:id',
        loadComponent: () =>
          import('./users/user-form/user-form.component').then(
            (m) => m.UserFormComponent,
          ),
      },

      // Orders
      {
        path: 'narudzbe',
        loadComponent: () =>
          import('./orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent,
          ),
      },
      {
        path: 'narudzbe/kreiraj',
        loadComponent: () =>
          import('./orders/order-form/order-form.component').then(
            (m) => m.OrderFormComponent,
          ),
      },
      {
        path: 'narudzbe/uredi/:id',
        loadComponent: () =>
          import('./orders/order-form/order-form.component').then(
            (m) => m.OrderFormComponent,
          ),
      },
      {
        path: 'narudzbe/detalji/:id',
        loadComponent: () =>
          import('./orders/order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent,
          ),
      },

      // Partner Orders (B2B)
      {
        path: 'narudzbe-partneri',
        loadComponent: () =>
          import('./orders-partners/admin-orders-partners.component').then(
            (m) => m.AdminOrdersPartnersComponent,
          ),
      },

      // Company Pricing
      {
        path: 'cijene-tvrtki',
        loadComponent: () =>
          import('./company-pricing/admin-company-pricing.component').then(
            (m) => m.AdminCompanyPricingComponent,
          ),
      },
      {
        path: 'cijene-tvrtki/kreiraj',
        loadComponent: () =>
          import('./company-pricing/company-pricing-form/company-pricing-form.component').then(
            (m) => m.CompanyPricingFormComponent,
          ),
      },
      {
        path: 'cijene-tvrtki/uredi/:id',
        loadComponent: () =>
          import('./company-pricing/company-pricing-form/company-pricing-form.component').then(
            (m) => m.CompanyPricingFormComponent,
          ),
      },
      {
        path: 'cijene-tvrtki/detalji/:id',
        loadComponent: () =>
          import('./company-pricing/company-pricing-form/company-pricing-form.component').then(
            (m) => m.CompanyPricingFormComponent,
          ),
      },

      // Companies
      {
        path: 'tvrtke',
        loadComponent: () =>
          import('./companies/admin-companies/admin-companies.component').then(
            (m) => m.AdminCompaniesComponent,
          ),
      },
      {
        path: 'tvrtke/kreiraj',
        loadComponent: () =>
          import('./companies/admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
          ),
      },
      {
        path: 'tvrtke/uredi/:id',
        loadComponent: () =>
          import('./companies/admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
          ),
      },
      {
        path: 'tvrtke/detalji/:id',
        loadComponent: () =>
          import('./companies/admin-company-edit/admin-company-edit.component').then(
            (m) => m.AdminCompanyEditComponent,
          ),
      },

      // Contacts
      {
        path: 'kontakti',
        loadComponent: () =>
          import('./contacts/admin-contacts.component').then(
            (m) => m.AdminContactsComponent,
          ),
      },

      // Wishlist
      {
        path: 'lista-zelja',
        loadComponent: () =>
          import('./wishlist/admin-wishlist.component').then(
            (m) => m.AdminWishlistComponent,
          ),
      },

      // Reviews
      {
        path: 'recenzije',
        loadComponent: () =>
          import('./reviews/admin-reviews.component').then(
            (m) => m.AdminReviewsComponent,
          ),
      },

      // Email Test
      {
        path: 'email-test',
        loadComponent: () =>
          import('../../shared/components/email-test/email-test.component').then(
            (m) => m.EmailTestComponent,
          ),
      },
    ],
  },
];
