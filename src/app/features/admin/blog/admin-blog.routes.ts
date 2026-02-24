import { Routes } from "@angular/router";

export const ADMIN_BLOG_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./admin-blog.component').then(
            (m) => m.AdminBlogComponent,
            ),
    },
    {
        path: 'kreiraj',
        loadComponent: () =>
            import('./blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
            ),
    },
    {
        path: 'uredi/:id',
        loadComponent: () =>
            import('./blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
            ),
    },
    {
        path: 'detalji/:id',
        loadComponent: () =>
            import('./blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
            ),
    },
];