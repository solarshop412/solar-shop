import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { take, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { User } from '../../../../../shared/models/user.model';
import * as CartActions from '../../../cart/store/cart.actions';
import * as OrdersActions from '../../../../admin/orders/store/orders.actions';
import { selectB2COrderCreating, selectB2COrderCreated, selectB2COrderError } from '../../../../admin/orders/store/orders.selectors';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { MonriPaymentService, MonriPaymentRequest } from '../../../../../shared/services/monri-payment.service';
import * as CartSelectors from '../../../cart/store/cart.selectors';
import { SettingsService } from '../../../../../shared/services/settings.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);
  private monriPaymentService = inject(MonriPaymentService);
  private settingsService = inject(SettingsService);

  paymentForm: FormGroup;
  isProcessing = false;
  orderNumber = '';
  currentUser$: Observable<User | null>;
  isCompanyUser$: Observable<boolean>;
  orderCreationError$ = new BehaviorSubject<string | null>(null);
  cartSummary$: Observable<any>;
  private subscriptions = new Subscription();
  creditCardPaymentEnabled = false; // Default to false until settings are loaded
  orderingEnabled = true; // Default to true until settings are loaded

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isCompanyUser$ = this.currentUser$.pipe(
      map((user: User | null) => user?.companyId != null)
    );
    this.cartSummary$ = this.store.select(CartSelectors.selectCartSummary);

    // Subscribe to settings to check if credit card payment and ordering are enabled
    this.subscriptions.add(
      this.settingsService.settings$.subscribe(settings => {
        const previousCreditCardValue = this.creditCardPaymentEnabled;
        this.creditCardPaymentEnabled = settings.credit_card_payment_enabled;
        this.orderingEnabled = settings.ordering_enabled;

        console.log('[Payment] Settings updated:', {
          previousCreditCard: previousCreditCardValue,
          currentCreditCard: this.creditCardPaymentEnabled,
          orderingEnabled: this.orderingEnabled,
          settings
        });

        // If credit card is now disabled and it was selected, switch to cash on delivery
        if (!this.creditCardPaymentEnabled && this.paymentForm?.get('paymentMethod')?.value === 'credit_card') {
          this.paymentForm.patchValue({ paymentMethod: 'cash_on_delivery' });
          console.log('[Payment] Switched payment method to cash_on_delivery because credit card is disabled');
        }
      })
    );

    this.paymentForm = this.fb.group({
      paymentMethod: ['cash_on_delivery', [Validators.required]],
      isB2BOrder: [false],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

  }

  ngOnInit(): void {
    // Subscribe to order creation success
    this.subscriptions.add(
      this.store.select(selectB2COrderCreated)
        .pipe(
          distinctUntilChanged()
        )
        .subscribe(order => {
          console.log('Order state changed in payment component:', order, 'isProcessing:', this.isProcessing);
          if (order && this.isProcessing) {
            console.log('Order created successfully:', order);
            this.isProcessing = false;
            this.orderNumber = order.orderNumber;
            this.handleOrderSuccess();
          }
        })
    );

    // Subscribe to order creation errors
    this.subscriptions.add(
      this.store.select(selectB2COrderError)
        .pipe(
          distinctUntilChanged()
        )
        .subscribe(error => {
          console.log('Error state changed in payment component:', error, 'isProcessing:', this.isProcessing);
          if (error && this.isProcessing) {
            console.error('Order creation failed:', error);
            this.isProcessing = false;

            // Check for specific error types
            if (error.includes('Insufficient stock')) {
              this.orderCreationError$.next(this.translationService.translate('checkout.oneOrMoreItemsUnavailable'));
            } else {
              this.orderCreationError$.next('Error creating order. Please try again.');
            }
          }
        })
    );
  }

  async onSubmit() {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;
    this.orderCreationError$.next(null); // Clear any previous errors

    // Clear any previous order state
    this.store.dispatch(OrdersActions.clearB2COrderState());

    const paymentMethod = this.paymentForm.get('paymentMethod')?.value;

    if (paymentMethod === 'credit_card') {
      await this.processMonriPayment();
    } else {
      await this.createOrder();
    }
  }

  private async createOrder() {
    // Get current user (optional for guest checkout)
    const currentUser = await this.store.select(selectCurrentUser).pipe(
      take(1)
    ).toPromise();

    // If no authenticated user, proceed with guest checkout
    if (!currentUser) {
      try {
        const session = await this.supabaseService.getSession();

        if (session?.user) {
          // Use authenticated user data
          const sessionUser = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Customer',
            lastName: session.user.user_metadata?.lastName || '',
            phone: session.user.user_metadata?.phone || ''
          };
          return this.createOrderWithUser(sessionUser);
        } else {
          // Proceed with guest checkout
          return this.createGuestOrder();
        }
      } catch (sessionError) {
        console.warn('Session error, proceeding with guest checkout:', sessionError);
        return this.createGuestOrder();
      }
    }

    return this.createOrderWithUser(currentUser);
  }

  private async createGuestOrder() {
    // Get shipping info from the shipping step
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');

    if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName) {
      throw new Error('Shipping information is required for guest checkout');
    }

    // Create guest user object from shipping info
    const guestUser = {
      id: null, // No user ID for guest orders
      email: shippingInfo.email,
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      phone: shippingInfo.phone || ''
    };

    return this.createOrderWithUser(guestUser);
  }

  private async createOrderWithUser(currentUser: any) {

    // Get cart items from localStorage that was saved during checkout flow
    const cartItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]');

    console.log('Cart items for order processing:', cartItems);

    if (!cartItems.length) {
      throw new Error('No items in cart for checkout');
    }

    return this.processCartItems(currentUser, cartItems);
  }

  private async processCartItems(currentUser: any, cartItems: any[]) {

    // Calculate totals from CartItem objects
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // No tax or shipping

    // Generate order number
    this.orderNumber = 'ORD-' + Date.now();

    // Get shipping info from localStorage (from shipping step)
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');

    // Create shipping and billing address objects
    const shippingAddress = {
      firstName: shippingInfo.firstName || currentUser.firstName || '',
      lastName: shippingInfo.lastName || currentUser.lastName || '',
      addressLine1: shippingInfo.address || '',
      addressLine2: shippingInfo.addressLine2 || null,
      city: shippingInfo.city || '',
      state: shippingInfo.state || '',
      postalCode: shippingInfo.postalCode || '',
      country: shippingInfo.country || '',
      phone: shippingInfo.phone || currentUser.phone || ''
    };

    // Get B2B flag from form
    const isB2BOrder = this.paymentForm.get('isB2BOrder')?.value || false;

    // Get payment method from form
    const paymentMethod = this.paymentForm.get('paymentMethod')?.value || 'cash_on_delivery';

    // Create order object
    const orderData = {
      order_number: this.orderNumber,
      user_id: currentUser.id, // Will be null for guest orders
      customer_email: currentUser.email,
      customer_name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      customer_phone: shippingInfo.phone || currentUser.phone,

      // Amounts
      subtotal: subtotal,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      total_amount: total,

      // Order details
      status: 'pending' as const,
      payment_status: paymentMethod === 'credit_card' ? 'pending' : 'pending',
      shipping_status: 'not_shipped' as const,
      payment_method: paymentMethod as 'cash_on_delivery' | 'credit_card',
      is_b2b: isB2BOrder,

      // Addresses as JSON
      shipping_address: shippingAddress,
      billing_address: shippingAddress, // Same as shipping for now

      // Timestamps
      order_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Dispatch NgRx action to create order with stock management
    console.log('Dispatching createB2COrder action with data:', { orderData, cartItems });
    this.store.dispatch(OrdersActions.createB2COrder({
      orderData,
      cartItems
    }));
  }

  /**
   * Process Monri payment for credit card transactions
   */
  private async processMonriPayment() {
    try {
      // Get current user
      const currentUser = await this.store.select(selectCurrentUser).pipe(take(1)).toPromise();
      
      // Get cart summary
      const cartSummary = await this.cartSummary$.pipe(take(1)).toPromise();
      
      if (!cartSummary) {
        throw new Error('Cart summary not available');
      }

      // Get shipping info
      const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
      
      // Generate order number for payment
      this.orderNumber = 'ORD-' + Date.now();

      // Prepare payment data for Monri
      const paymentData: MonriPaymentRequest = {
        order_number: this.orderNumber,
        amount: this.monriPaymentService.formatAmountToCents(cartSummary.subtotal), // Convert to cents
        currency: 'EUR',
        order_info: `Solar Shop Order ${this.orderNumber}`,
        ch_full_name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
        ch_address: shippingInfo.address || '',
        ch_city: shippingInfo.city || '',
        ch_zip: shippingInfo.postalCode || '',
        ch_country: shippingInfo.country || 'HR',
        ch_phone: shippingInfo.phone || '',
        ch_email: currentUser?.email || shippingInfo.email || '',
        language: 'hr',
        transaction_type: 'purchase'
      };

      // Store order data temporarily for after payment completion
      localStorage.setItem('pendingOrderData', JSON.stringify({
        currentUser: currentUser || {
          id: null,
          email: shippingInfo.email,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          phone: shippingInfo.phone
        },
        orderNumber: this.orderNumber,
        paymentMethod: 'credit_card'
      }));

      // Create form parameters and submit to Monri
      const formParams = await this.monriPaymentService.createPaymentRequest(paymentData);
      
      // Submit payment form to Monri
      this.monriPaymentService.submitPaymentForm(formParams);
      
    } catch (error) {
      console.error('Error processing Monri payment:', error);
      this.isProcessing = false;
      this.orderCreationError$.next('Error processing payment. Please try again.');
    }
  }

  private handleOrderSuccess() {
    console.log('Handling order success, orderNumber:', this.orderNumber);

    // Clear cart - localStorage and NgRx store
    localStorage.removeItem('checkoutItems');
    localStorage.removeItem('shippingInfo');

    // Dispatch order completion action which will automatically clear cart
    this.store.dispatch(CartActions.orderCompleted({
      orderId: '', // Will be filled by the effect
      orderNumber: this.orderNumber
    }));

    // Clear the order state after success
    this.store.dispatch(OrdersActions.clearB2COrderState());

  }



  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/blagajna/dostava']);
  }
} 