import { Routes } from "@angular/router";

export const ADMIN_BLOG_ROUTES: Routes = [
    {
        path: 'blog',
        loadComponent: () =>
            import('./admin-blog.component').then(
            (m) => m.AdminBlogComponent,
            ),
    },
    {
        path: 'blog/kreiraj',
        loadComponent: () =>
            import('./blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
            ),
    },
    {
        path: 'blog/uredi/:id',
        loadComponent: () =>
            import('./blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
            ),
    },
    {
        path: 'blog/detalji/:id',
        loadComponent: () =>
            import('./blog-form/blog-form.component').then(
            (m) => m.BlogFormComponent,
            ),
    },
];