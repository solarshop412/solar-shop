import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-b2b-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './b2b-order-details.component.html',
  styleUrls: ['./b2b-order-details.component.scss'],
})
export class B2bOrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);

  order: Order | null = null;
  loading = true;
  error = false;

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      await this.loadOrderDetails(orderId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  private async loadOrderDetails(orderId: string): Promise<void> {
    try {
      const { data: order, error } = await this.supabaseService.client
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price,
            product_image_url,
            product_specifications
          )
        `,
        )
        .eq('id', orderId)
        .eq('is_b2b', true)
        .single();

      if (error) {
        console.error('Error loading order details:', error);
        this.error = true;
        return;
      }

      if (!order) {
        this.error = true;
        return;
      }

      // Map the order data
      this.order = {
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
      };
    } catch (error) {
      console.error('Error loading order details:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'b2b.orders.pending',
      confirmed: 'b2b.orders.confirmed',
      processing: 'b2b.orders.processing',
      shipped: 'b2b.orders.shipped',
      delivered: 'b2b.orders.delivered',
      cancelled: 'b2b.orders.cancelled',
    };
    return statusMap[status] || status;
  }

  getPaymentStatusLabel(paymentStatus: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'b2b.orders.pending',
      paid: 'b2b.orders.paid',
      failed: 'b2b.orders.failed',
    };
    return statusMap[paymentStatus] || paymentStatus;
  }

  getPaymentMethodLabel(paymentMethod: string): string {
    const methodMap: { [key: string]: string } = {
      payment_upon_collection: 'b2b.orders.paymentUponCollection',
      bank_transfer: 'b2b.orders.bankTransfer',
      cash_on_delivery: 'b2b.orders.cashOnDelivery',
      credit_30_days: 'b2b.orders.creditTerms30Days',
    };
    return methodMap[paymentMethod] || paymentMethod;
  }

  getShippingAddressField(field: string): string | null {
    if (!this.order?.shippingAddress) return null;
    // Type assertion to handle dynamic B2B address fields
    const address = this.order.shippingAddress as any;
    return address[field] || null;
  }

  getBillingAddressField(field: string): string | null {
    if (!this.order?.billingAddress) return null;
    // Type assertion to handle dynamic B2B address fields
    const address = this.order.billingAddress as any;
    return address[field] || null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Hide the broken image and let the fallback icon show
      img.style.display = 'none';
    }
  }

  getFormattedDate(date: string): string {
    const currentLanguage = this.translationService.getCurrentLanguage();
    const locale = currentLanguage === 'hr' ? 'hr-HR' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
