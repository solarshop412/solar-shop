import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MonriPaymentService } from '../../../../shared/services/monri-payment.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import * as OrdersActions from '../../../admin/orders/store/orders.actions';
import * as CartActions from '../../cart/store/cart.actions';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './payment-callback.component.html',
  styleUrls: ['./payment-callback.component.scss'],
})
export class PaymentCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private monriPaymentService = inject(MonriPaymentService);

  isProcessing = true;
  paymentStatus: 'success' | 'failed' | 'cancelled' | null = null;
  orderNumber = '';
  errorMessage = '';

  ngOnInit(): void {
    this.processPaymentCallback();
  }

  private async processPaymentCallback(): Promise<void> {
    try {
      // Get query parameters from Monri callback
      this.route.queryParams.subscribe(async (params) => {
        console.log('Payment callback received with params:', params);

        const status = params['status'];
        const orderNumber = params['order_number'] || params['order-number'];
        const transactionId =
          params['transaction_id'] || params['transaction-id'];
        const errorMessage = params['error_message'] || params['error-message'];
        const responseCode = params['response_code'] || params['response-code'];

        this.orderNumber = orderNumber || '';

        console.log('Processed callback parameters:', {
          status,
          orderNumber: this.orderNumber,
          transactionId,
          responseCode,
          errorMessage,
        });

        // Handle different Monri response statuses
        if (
          status === 'approved' ||
          status === 'success' ||
          responseCode === '0000'
        ) {
          await this.handleSuccessfulPayment(params);
        } else if (
          status === 'declined' ||
          status === 'error' ||
          status === 'failed'
        ) {
          this.handleFailedPayment(errorMessage || 'Payment was declined');
        } else if (status === 'cancelled' || status === 'canceled') {
          this.handleCancelledPayment();
        } else {
          console.warn('Unknown payment status received:', status);
          this.handleFailedPayment(`Unknown payment status: ${status}`);
        }

        this.isProcessing = false;
      });
    } catch (error) {
      console.error('Error processing payment callback:', error);
      this.handleFailedPayment('Error processing payment callback');
      this.isProcessing = false;
    }
  }

  private async handleSuccessfulPayment(callbackParams: any): Promise<void> {
    try {
      this.paymentStatus = 'success';

      // Get pending order data from localStorage
      const pendingOrderData = JSON.parse(
        localStorage.getItem('pendingOrderData') || '{}',
      );

      if (pendingOrderData.orderNumber) {
        this.orderNumber = pendingOrderData.orderNumber;

        // Create the order in the database now that payment is successful
        await this.createOrderAfterPayment(pendingOrderData, callbackParams);

        // Clear pending order data
        localStorage.removeItem('pendingOrderData');
      }
    } catch (error) {
      console.error('Error handling successful payment:', error);
      this.handleFailedPayment('Error processing successful payment');
    }
  }

  private async createOrderAfterPayment(
    pendingOrderData: any,
    callbackParams: any,
  ): Promise<void> {
    try {
      // Get cart items and shipping info
      const cartItems = JSON.parse(
        localStorage.getItem('checkoutItems') || '[]',
      );
      const shippingInfo = JSON.parse(
        localStorage.getItem('shippingInfo') || '{}',
      );

      if (!cartItems.length) {
        throw new Error('No cart items found');
      }

      const currentUser = pendingOrderData.currentUser;
      const subtotal = cartItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );

      // Create shipping address
      const shippingAddress = {
        firstName: shippingInfo.firstName || currentUser.firstName || '',
        lastName: shippingInfo.lastName || currentUser.lastName || '',
        addressLine1: shippingInfo.address || '',
        addressLine2: shippingInfo.addressLine2 || null,
        city: shippingInfo.city || '',
        state: shippingInfo.state || '',
        postalCode: shippingInfo.postalCode || '',
        country: shippingInfo.country || '',
        phone: shippingInfo.phone || currentUser.phone || '',
      };

      // Create order data
      const orderData = {
        order_number: this.orderNumber,
        user_id: currentUser.id,
        customer_email: currentUser.email,
        customer_name:
          `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        customer_phone: shippingInfo.phone || currentUser.phone,
        subtotal: subtotal,
        tax_amount: 0,
        shipping_cost: 0,
        discount_amount: 0,
        total_amount: subtotal,
        status: 'confirmed' as const, // Confirmed since payment is successful
        payment_status: 'paid' as const, // Mark as paid
        shipping_status: 'not_shipped' as const,
        payment_method: 'credit_card' as const,
        is_b2b: false,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        order_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add payment reference
        notes: `Monri Payment ID: ${callbackParams.transaction_id || 'N/A'}`,
      };

      // Dispatch order creation
      this.store.dispatch(
        OrdersActions.createB2COrder({
          orderData,
          cartItems,
        }),
      );

      // Clear cart after successful payment
      this.store.dispatch(
        CartActions.orderCompleted({
          orderId: '',
          orderNumber: this.orderNumber,
        }),
      );

      // Clear localStorage
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('shippingInfo');
    } catch (error) {
      console.error('Error creating order after payment:', error);
      throw error;
    }
  }

  private handleFailedPayment(errorMessage: string): void {
    this.paymentStatus = 'failed';
    this.errorMessage = errorMessage;
  }

  private handleCancelledPayment(): void {
    this.paymentStatus = 'cancelled';
  }

  goToOrderConfirmation(): void {
    this.router.navigate(['/order-confirmation'], {
      queryParams: { orderNumber: this.orderNumber },
    });
  }

  retryPayment(): void {
    this.router.navigate(['/blagajna/placanje']);
  }

  goToCart(): void {
    this.router.navigate(['/kosarica']);
  }
}
