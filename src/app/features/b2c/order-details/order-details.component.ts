import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);

  order: Order | null = null;
  loading = true;
  error = false;
  imageErrors = new Set<string>();

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  private async loadOrder(orderId: string): Promise<void> {
    try {
      this.loading = true;
      this.error = false;

      console.log(`Loading order details for ID: ${orderId}`);

      // Load order from database
      const orderData = await this.supabaseService.getTableById('orders', orderId);

      if (!orderData) {
        console.error(`Order not found with ID: ${orderId}`);
        this.error = true;
        return;
      }

      console.log('Order data loaded:', orderData);

      // Load order items
      const orderItemsData = await this.supabaseService.getTable('order_items', {
        order_id: orderId
      });

      console.log(`Loaded ${orderItemsData?.length || 0} order items:`, orderItemsData);

      // Convert database order to Order model
      this.order = {
        id: orderData.id,
        orderNumber: orderData.order_number,
        userId: orderData.user_id || undefined,
        customerEmail: orderData.customer_email,
        customerName: orderData.customer_name || undefined,
        customerPhone: orderData.customer_phone || undefined,
        totalAmount: orderData.total_amount || 0,
        subtotal: orderData.subtotal || 0,
        taxAmount: orderData.tax_amount || 0,
        shippingCost: orderData.shipping_cost || 0,
        discountAmount: orderData.discount_amount || 0,
        status: orderData.status,
        paymentStatus: orderData.payment_status,
        shippingStatus: orderData.shipping_status || undefined,
        paymentMethod: orderData.payment_method || undefined,
        orderDate: orderData.order_date,
        shippingAddress: orderData.shipping_address || undefined,
        billingAddress: orderData.billing_address || undefined,
        trackingNumber: orderData.tracking_number || undefined,
        notes: orderData.notes || undefined,
        adminNotes: orderData.admin_notes || undefined,
        items: await Promise.all((orderItemsData || []).map(async (itemData: any) => {
          let productImageUrl = itemData.product_image_url;

          // If no image URL in order item and we have a product ID, try to get it from products table
          if (!productImageUrl && itemData.product_id) {
            try {
              const productData = await this.supabaseService.getTableById('products', itemData.product_id);
              if (productData?.images && productData.images.length > 0) {
                productImageUrl = productData.images[0].url || productData.images[0];
              }
            } catch (error) {
              console.warn('Could not load product image for product ID:', itemData.product_id, error);
            }
          }

          const orderItem = {
            id: itemData.id,
            orderId: itemData.order_id,
            productId: itemData.product_id || undefined,
            productName: itemData.product_name || 'Unknown Product',
            productSku: itemData.product_sku || undefined,
            quantity: itemData.quantity || 0,
            unitPrice: itemData.unit_price || 0,
            totalPrice: itemData.total_price || 0,
            discountAmount: itemData.discount_amount || 0,
            discountPercentage: itemData.discount_percentage || 0,
            productImageUrl: productImageUrl || undefined,
            productSpecifications: itemData.product_specifications || undefined,
            createdAt: itemData.created_at
          };

          console.log('Mapped order item:', orderItem);
          return orderItem;
        })),
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at
      };

      console.log('Successfully loaded complete order:', this.order);

    } catch (error) {
      console.error('Error loading order:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  hasImageError(itemId: string): boolean {
    return this.imageErrors.has(itemId);
  }

  onImageError(itemId: string): void {
    this.imageErrors.add(itemId);
  }

  onImageLoad(itemId: string): void {
    this.imageErrors.delete(itemId);
  }

  getPaymentMethodTranslation(paymentMethod: string): string {
    const translationKey = this.getPaymentMethodKey(paymentMethod);
    return translationKey;
  }

  private getPaymentMethodKey(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'credit_card':
        return 'admin.ordersForm.creditCard';
      case 'debit_card':
        return 'admin.ordersForm.debitCard';
      case 'bank_transfer':
        return 'admin.ordersForm.bankTransfer';
      case 'cash_on_delivery':
        return 'admin.ordersForm.cashOnDelivery';
      case 'paypal':
        return 'checkout.paypal';
      default:
        return paymentMethod;
    }
  }

  getFormattedDate(date: string): string {
    const currentLanguage = this.translationService.getCurrentLanguage();
    const locale = currentLanguage === 'hr' ? 'hr-HR' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 