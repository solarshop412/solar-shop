import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';
import { LoginGuard } from './core/auth/guards/login.guard';
import { PageLayoutComponent } from './core/page-layout/page-layout.component';
import { CompanyComponent } from './features/b2c/company/company.component';
import { BlogComponent } from './features/b2c/blog/blog.component';
import { BlogDetailComponent } from './features/b2c/blog/blog-detail.component';
import { ProductListComponent } from './features/b2c/products/product-list/product-list.component';
import { HomeComponent } from './features/b2c/home/home.component';
import { ProductDetailsComponent } from './features/b2c/products/product-details/product-details.component';
import { OffersPageComponent } from './features/b2c/offers/offers-page.component';
import { MissionComponent } from './features/b2c/mission/mission.component';
import { ContactComponent } from './features/b2c/contact/contact.component';
import { CheckoutComponent } from './features/b2c/checkout/checkout.component';
import { OrderReviewComponent } from './features/b2c/checkout/steps/order-review/order-review.component';
import { ShippingComponent } from './features/b2c/checkout/steps/shipping/shipping.component';
import { PaymentComponent } from './features/b2c/checkout/steps/payment/payment.component';

export const routes: Routes = [
    {
        path: '', component: PageLayoutComponent,
        // canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'products', component: ProductListComponent },
            { path: 'products/:id', component: ProductDetailsComponent },
            { path: 'offers', component: OffersPageComponent },
            { path: 'mission', component: MissionComponent },
            { path: 'company', component: CompanyComponent },
            { path: 'contact', component: ContactComponent },
            { path: 'blog', component: BlogComponent },
            { path: 'blog/:id', component: BlogDetailComponent },
            {
                path: 'checkout',
                component: CheckoutComponent,
                children: [
                    { path: '', redirectTo: 'order-review', pathMatch: 'full' },
                    { path: 'order-review', component: OrderReviewComponent },
                    { path: 'shipping', component: ShippingComponent },
                    { path: 'payment', component: PaymentComponent }
                ]
            },
            // { path: 'purchase-orders', loadChildren: () => import('./features/purchase-orders').then(m => m.PURCHASE_ORDER_ROUTES) },
            // { path: 'budgets', loadChildren: () => import('./features/budgets').then(m => m.BUDGETS_ORDER_ROUTES) },
            // { path: 'projects', loadChildren: () => import('./features/projects').then(m => m.PROJECTS_ORDER_ROUTES) },
            // { path: 'employees', loadChildren: () => import('./features/employees').then(m => m.EMPLOYEES_ROUTES) },
            // { path: 'invoices', loadChildren: () => import('./features/invoices').then(m => m.INVOICES_ORDER_ROUTES) },
            // { path: 'settings', loadChildren: () => import('./features/settings').then(m => m.SETTINGS_ORDER_ROUTES) },
            // { path: 'vendors', loadChildren: () => import('./features/vendors').then(m => m.VENDORS_ROUTES) }
        ]
    },
    { path: 'login', canActivate: [LoginGuard], component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
];
