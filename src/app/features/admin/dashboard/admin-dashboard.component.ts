import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Observable, from } from 'rxjs';
import { DashboardStats } from '../../../shared/models/dashboard-stats.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private titleService = inject(Title);
  private router = inject(Router);

  stats$: Observable<DashboardStats>;

  constructor() {
    this.stats$ = this.loadStats();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard - Solar Shop Admin');
  }

  refreshStats(): void {
    this.stats$ = this.loadStats();
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/admin/narudzbe/edit', orderId]);
  }

  getOrderStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusLabels[status] || status;
  }

  private loadStats(): Observable<DashboardStats> {
    const loadStatsAsync = async () => {
      try {
        const [products, categories, blogPosts, offers, users] =
          await Promise.all([
            this.supabaseService.getTable('products'),
            this.supabaseService.getTable('categories'),
            this.supabaseService.getTable('blog_posts'),
            this.supabaseService.getTable('offers'),
            this.supabaseService.getTable('profiles'),
          ]);

        const orders = await this.supabaseService.getTable('orders');
        const recentOrders = (orders || [])
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .slice(0, 5);

        return {
          totalProducts: products?.length || 0,
          totalCategories: categories?.length || 0,
          totalBlogPosts: blogPosts?.length || 0,
          totalOffers: offers?.length || 0,
          totalUsers: users?.length || 0,
          totalOrders: orders?.length || 0,
          recentOrders: recentOrders,
        };
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        return {
          totalProducts: 0,
          totalCategories: 0,
          totalBlogPosts: 0,
          totalOffers: 0,
          totalUsers: 0,
          totalOrders: 0,
          recentOrders: [],
        };
      }
    };

    return from(loadStatsAsync());
  }
}
