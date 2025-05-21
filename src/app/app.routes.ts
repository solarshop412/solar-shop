import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';
import { LoginGuard } from './core/auth/guards/login.guard';
import { PageLayoutComponent } from './core/auth/page-layout/page-layout.component';

export const routes: Routes = [
    {
        path: '', component: PageLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'home', component: HomeComponent },
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
