import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { User } from '../../../../../shared/models/user.model';
import { Company } from '../../../../../shared/models/company.model';
import { selectB2BCartItems, selectB2BCartSubtotal } from '../../../cart/store/b2b-cart.selectors';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import { B2BCartItem } from '../../../cart/models/b2b-cart.model';
import { SettingsService } from '../../../../../shared/services/settings.service';

@Component({
  selector: 'app-b2b-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './b2b-payment.component.html',
  styleUrls: ['./b2b-payment.component.scss']
})
export class B2bPaymentComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();

  paymentForm: FormGroup;
  currentUser: User | null = null;
  company: Company | null = null;
  cartItems: B2BCartItem[] = [];
  cartTotal = 0;
  processing = false;
  orderingEnabled = true;

  constructor() {
    this.paymentForm = this.fb.group({
      paymentMethod: ['payment_upon_collection', [Validators.required]],
      specialInstructions: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

    // Subscribe to settings to check if ordering is enabled
    this.settingsService.settings$.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.orderingEnabled = settings.ordering_enabled;
    });
  }

  async ngOnInit(): Promise<void> {
    // Get current user and cart data
    combineLatest([
      this.store.select(selectCurrentUser),
      this.store.select(selectB2BCartItems),
      this.store.select(selectB2BCartSubtotal)
    ]).pipe(takeUntil(this.destroy$)).subscribe(async ([user, items, total]) => {
      this.currentUser = user;
      this.cartItems = items;
      this.cartTotal = total;

      if (user) {
        await this.loadCompanyInfo(user.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadCompanyInfo(userId: string): Promise<void> {
    try {
      const { data: companies, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', userId)
        .eq('status', 'approved')
        .single();

      if (!error && companies) {
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
          approvedAt: companies.approved_at ? new Date(companies.approved_at) : undefined,
          approvedBy: companies.approved_by,
          rejectedAt: companies.rejected_at ? new Date(companies.rejected_at) : undefined,
          rejectedBy: companies.rejected_by,
          rejectionReason: companies.rejection_reason,
          createdAt: new Date(companies.created_at),
          updatedAt: new Date(companies.updated_at)
        };
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.paymentForm.invalid || !this.currentUser || !this.company || this.cartItems.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Get checkout data from localStorage
      const shippingInfo = JSON.parse(localStorage.getItem('b2b_shipping_info') || '{}');
      const paymentData = this.paymentForm.value;

      // Calculate totals
      const subtotal = this.cartTotal;
      const totalAmount = subtotal; // No tax for B2B

      // Generate order number (max 20 chars)
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const randomId = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 char random
      const orderNumber = `B2B${timestamp}${randomId}`; // Format: B2B12345678ABCD (15 chars)

      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: this.currentUser.id,
        customer_email: this.currentUser.email,
        customer_name: `${this.currentUser.firstName} ${this.currentUser.lastName}`.substring(0, 50), // Limit to 50 chars
        customer_phone: (this.currentUser.phone || '').substring(0, 20), // Limit to 20 chars
        total_amount: totalAmount,
        subtotal: subtotal,
        tax_amount: 0,
        shipping_cost: 0,
        discount_amount: 0,
        status: 'pending',
        payment_status: paymentData.paymentMethod === 'credit_30_days' ? 'pending' : 'pending',
        payment_method: paymentData.paymentMethod === 'payment_upon_collection' ? 'cash_on_delivery' : (paymentData.paymentMethod || '').substring(0, 20),
        shipping_address: {
          contactName: (shippingInfo.contactName || '').substring(0, 100),
          contactEmail: (shippingInfo.contactEmail || '').substring(0, 100),
          contactPhone: (shippingInfo.contactPhone || '').substring(0, 20),
          address: (shippingInfo.deliveryAddress || '').substring(0, 200),
          city: (shippingInfo.deliveryCity || '').substring(0, 50),
          postalCode: (shippingInfo.deliveryPostalCode || '').substring(0, 20),
          country: (shippingInfo.deliveryCountry || '').substring(0, 50),
          shippingMethod: (shippingInfo.shippingMethod || 'standard').substring(0, 20),
          deliveryInstructions: (shippingInfo.deliveryInstructions || '').substring(0, 500),
          purchaseOrderNumber: (shippingInfo.purchaseOrderNumber || '').substring(0, 50)
        },
        billing_address: {
          companyId: this.company.id,
          companyName: (this.company.companyName || '').substring(0, 100),
          address: (this.company.companyAddress || '').substring(0, 200),
          email: (this.company.companyEmail || '').substring(0, 100),
          phone: (this.company.companyPhone || '').substring(0, 20),
          taxNumber: (this.company.taxNumber || '').substring(0, 50)
        },
        notes: (paymentData.specialInstructions || '').substring(0, 1000),
        is_b2b: true,
        order_date: new Date().toISOString()
      };

      // Insert order
      const { data: order, error: orderError } = await this.supabaseService.client
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return;
      }

      // Insert order items
      const orderItems = this.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: (item.name || '').substring(0, 200),
        product_sku: (item.sku || '').substring(0, 50),
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        product_image_url: (item.imageUrl || '').substring(0, 500),
        product_specifications: {}
      }));

      const { error: itemsError } = await this.supabaseService.client
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return;
      }

      // Clear cart
      this.store.dispatch(B2BCartActions.clearB2BCart());

      // Clear checkout data
      localStorage.removeItem('b2b_shipping_info');

      // Show success message and redirect
      this.showSuccessToast();

      // Redirect to products page after successful order
      setTimeout(() => {
        this.router.navigate(['/partneri/proizvodi'], {
          queryParams: { orderSuccess: true, orderNumber: orderNumber }
        });
      }, 2000);

    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      this.processing = false;
    }
  }

  private showSuccessToast(): void {
    // Create and show success toast
    const successMessage = this.translationService.translate('b2bCheckout.orderPlacedSuccessfully');
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>${successMessage}</span>
            </div>
        `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/partneri/blagajna/dostava']);
  }
} 