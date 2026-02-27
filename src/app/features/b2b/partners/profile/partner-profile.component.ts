import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Order } from '../../../../shared/models/order.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './partner-profile.component.html',
  styleUrls: ['./partner-profile.component.scss'],
})
export class PartnerProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  currentUser$: Observable<User | null>;

  loading = true;
  updating = false;
  ordersLoading = false;
  isCompanyContact = false;
  company: Company | null = null;
  companyOrders: Order[] = [];
  filteredOrders: Order[] = [];
  orderStatusFilter = '';
  activeTab: 'company-info' | 'support' | 'company-orders' | 'company-pricing' =
    'company-info';
  showSuccessMessage = false;

  companyInfoForm: FormGroup;

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);

    this.companyInfoForm = this.fb.group({
      companyName: ['', [Validators.required]],
      businessType: [''],
      taxNumber: ['', [Validators.required]],
      website: [''],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required]],
      companyAddress: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Check for order success query param
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params['orderSuccess'] && params['orderNumber']) {
        this.showOrderSuccessMessage(params['orderNumber']);
      }
    });

    // Subscribe to current user from NgRx store
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      console.log('NgRx user state changed:', user);
      if (user) {
        this.loadPartnerProfile(user);
      } else {
        console.log('No user in NgRx store, redirecting to login');
        this.loading = false;
        this.router.navigate(['/prijava']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadPartnerProfile(currentUser: User): Promise<void> {
    try {
      this.loading = true;
      console.log(
        'Starting to load partner profile for user:',
        currentUser.id,
        currentUser.email,
      );

      // Check if user is a company contact person
      const { data: companies, error: companyError } =
        await this.supabaseService.client
          .from('companies')
          .select('*')
          .eq('contact_person_id', currentUser.id)
          .eq('status', 'approved')
          .single();

      console.log('Company query result:', { companies, companyError });

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          console.log(
            'No approved company found for this user (this is normal if user is not a partner)',
          );
        } else {
          console.error('Database error when checking company:', companyError);
        }
        this.isCompanyContact = false;
        this.loading = false;
        return;
      }

      if (!companies) {
        console.log('User is not an approved company contact');
        this.isCompanyContact = false;
        this.loading = false;
        return;
      }

      console.log(
        'Found approved company:',
        companies.company_name,
        companies.id,
      );

      // Map database response to TypeScript model
      this.company = {
        id: companies.id,
        contactPersonId: companies.contact_person_id,
        contactPersonName: companies.contact_person_name,
        companyName: companies.company_name,
        taxNumber: companies.tax_number,
        companyAddress: companies.company_address,
        companyPhone: companies.company_phone,
        companyEmail: companies.company_email,
        website: companies.website,
        businessType: companies.business_type,
        yearsInBusiness: companies.years_in_business,
        annualRevenue: companies.annual_revenue,
        numberOfEmployees: companies.number_of_employees,
        description: companies.description,
        status: companies.status,
        approved: companies.approved,
        approvedAt: companies.approved_at
          ? new Date(companies.approved_at)
          : undefined,
        approvedBy: companies.approved_by,
        rejectedAt: companies.rejected_at
          ? new Date(companies.rejected_at)
          : undefined,
        rejectedBy: companies.rejected_by,
        rejectionReason: companies.rejection_reason,
        createdAt: new Date(companies.created_at),
        updatedAt: new Date(companies.updated_at),
      };

      this.isCompanyContact = true;

      // Populate form with company data
      this.companyInfoForm.patchValue({
        companyName: this.company.companyName || '',
        businessType: this.company.businessType || '',
        taxNumber: this.company.taxNumber || '',
        website: this.company.website || '',
        companyEmail: this.company.companyEmail || '',
        companyPhone: this.company.companyPhone || '',
        companyAddress: this.company.companyAddress || '',
      });

      // Load company orders
      await this.loadCompanyOrders();
    } catch (error) {
      console.error('Error loading partner profile:', error);
      this.isCompanyContact = false;
    } finally {
      this.loading = false;
    }
  }

  private async loadCompanyOrders(): Promise<void> {
    if (!this.company) {
      console.log('No company data available for loading orders');
      return;
    }

    try {
      this.ordersLoading = true;
      console.log(
        'Loading orders for company:',
        this.company.id,
        'contactPersonId:',
        this.company.contactPersonId,
      );

      const { data: orders, error } = await this.supabaseService.client
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `,
        )
        .eq('is_b2b', true)
        .eq('user_id', this.company.contactPersonId)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { data: orders, error });

      if (error) {
        console.error('Error loading company orders:', error);
        return;
      }

      // Map database orders to TypeScript model
      this.companyOrders = (orders || []).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        totalAmount: order.total_amount,
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingCost: order.shipping_cost,
        discountAmount: order.discount_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        shippingStatus: order.shipping_status,
        paymentMethod: order.payment_method,
        orderDate: order.order_date,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number,
        notes: order.notes,
        adminNotes: order.admin_notes,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          productImageUrl: item.product_image_url,
          productSpecifications: item.product_specifications,
          createdAt: item.created_at,
        })),
        is_b2b: order.is_b2b,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }));

      this.filteredOrders = [...this.companyOrders];
      console.log(
        'Successfully loaded and mapped orders:',
        this.companyOrders.length,
        'orders',
      );
    } catch (error) {
      console.error('Error loading company orders:', error);
    } finally {
      this.ordersLoading = false;
    }
  }

  setActiveTab(tab: 'company-info' | 'company-orders' | 'support'): void {
    this.activeTab = tab;
    this.showSuccessMessage = false;

    if (tab === 'company-orders' && this.companyOrders.length === 0) {
      this.loadCompanyOrders();
    }
  }

  async updateCompanyInfo(): Promise<void> {
    if (this.companyInfoForm.invalid || !this.company) return;

    try {
      this.updating = true;
      const formData = this.companyInfoForm.value;

      const { data, error } = await this.supabaseService.client
        .from('companies')
        .update({
          company_name: formData.companyName,
          business_type: formData.businessType,
          tax_number: formData.taxNumber,
          website: formData.website,
          company_email: formData.companyEmail,
          company_phone: formData.companyPhone,
          company_address: formData.companyAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.company.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        return;
      }

      // Update local company data
      this.company = { ...this.company, ...formData };
      this.showSuccessMessage = true;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
    } catch (error) {
      console.error('Error updating company info:', error);
    } finally {
      this.updating = false;
    }
  }

  filterOrders(): void {
    if (!this.orderStatusFilter) {
      this.filteredOrders = [...this.companyOrders];
    } else {
      this.filteredOrders = this.companyOrders.filter(
        (order) => order.status === this.orderStatusFilter,
      );
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBannerClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'b2b.profile.pendingApproval',
      approved: 'b2b.profile.approvedPartner',
      rejected: 'b2b.profile.applicationRejected',
    };

    return statusMap[status] || status;
  }

  getStatusDescription(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'b2b.profile.pendingApprovalDescription',
      approved: 'b2b.profile.approvedPartnerDescription',
      rejected: 'b2b.profile.applicationRejectedDescription',
    };
    return statusMap[status] || '';
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getOrderStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'b2b.orders.pending',
      processing: 'b2b.orders.processing',
      shipped: 'b2b.orders.shipped',
      delivered: 'b2b.orders.delivered',
      cancelled: 'b2b.orders.cancelled',
    };
    return statusMap[status] || status;
  }

  getPaymentStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      paid: 'b2b.orders.paid',
      pending: 'b2b.orders.pending',
      failed: 'b2b.orders.failed',
    };
    return statusMap[status] || status;
  }

  getTotalSpent(): number {
    return this.companyOrders.reduce(
      (total, order) => total + order.subtotal,
      0,
    );
  }

  getActiveOrders(): number {
    return this.companyOrders.filter((order) =>
      ['pending', 'processing', 'shipped'].includes(order.status),
    ).length;
  }

  getDeliveredOrders(): number {
    return this.companyOrders.filter((order) => order.status === 'delivered')
      .length;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/partneri/detalji-narudzbe', order.id]);
  }

  reorderItems(order: Order): void {
    // TODO: Implement reorder functionality
    console.log('Reordering items from order:', order.id);
  }

  contactSupport(): void {
    this.router.navigate(['/partneri/kontakt']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partneri/proizvodi']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  private showOrderSuccessMessage(orderNumber: string): void {
    this.showSuccessMessage = true;
    // Hide success message after 5 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
}
