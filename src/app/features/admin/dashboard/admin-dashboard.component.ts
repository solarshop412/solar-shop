import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Observable, from } from 'rxjs';
import { DashboardStats } from '../../../shared/models/dashboard-stats.model';
import { Store } from '@ngrx/store';
import { selectPendingCompanies } from '../companies/store/companies.selectors';

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

  constructor(private store: Store) {
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
        const [products, orders, complaints, pendingCompanies, productsInquiry] =
          await Promise.all([
            this.supabaseService.getTableCount('products'),
            this.supabaseService.getTableCount('orders'),
            this.supabaseService.getTableCount('complaints'),
            this.supabaseService.getTableCount('companies', {
              eq: {
                status: 'pending'
              }
            }),
            this.supabaseService.getTableCount('products_inquiry', {
              eq: {
                status: 'pending'
              }
            }) 
          ]);

        return {
          totalProducts: products || 0,
          totalOrders: orders || 0,
          totalComplaints: complaints || 0,
          pendingCompanies: pendingCompanies || 0,
          productsInquiry: productsInquiry || 0
        };
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        return {
          totalProducts: 0,
          totalOrders: 0,
          totalComplaints: 0,
          pendingCompanies: 0,
          productsInquiry: 0
        };
      }
    };

    return from(loadStatsAsync());
  }
}
