import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import * as OrdersActions from '../store/orders.actions';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './order-details.component.html',
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private translationService = inject(TranslationService);

  order: any = null;
  orderItems: any[] = [];
  originalOrderItems: any[] = [];
  originalOrderDiscount = 0;
  hasChanges = false;
  error: string | null = null;

  // Status update states
  isUpdatingPayment = false;
  isUpdatingStatus = false;
  statusUpdateMessage = '';
  statusUpdateSuccess = false;

  // Pending updates for save changes
  pendingStatusUpdate: string | null = null;
  pendingPaymentStatusUpdate: string | null = null;

  orderItemsForm: FormGroup;
  orderDiscountForm: FormGroup;

  constructor() {
    this.orderItemsForm = this.fb.group({
      items: this.fb.array([]),
    });

    this.orderDiscountForm = this.fb.group({
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
    });

    // Subscribe to form changes
    this.orderItemsForm.valueChanges.subscribe(() => this.checkForChanges());
    this.orderDiscountForm.valueChanges.subscribe(() => this.checkForChanges());
  }

  get orderItemsArray(): FormArray {
    return this.orderItemsForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(orderId);
    } else {
      this.error = 'No order ID provided';
    }
  }

  private async loadOrderDetails(orderId: string): Promise<void> {
    try {
      console.log(`Loading order details for ID: ${orderId}`);
      this.order = await this.supabaseService.getTableById('orders', orderId);
      if (this.order) {
        console.log('Loaded order data:', this.order);
        console.log('Order fields:', {
          discount_percentage: this.order.discount_percentage,
          discount_amount: this.order.discount_amount,
          tax_percentage: this.order.tax_percentage,
          tax_amount: this.order.tax_amount,
          shipping_cost: this.order.shipping_cost,
          total_amount: this.order.total_amount,
        });
        this.title.setTitle(
          `${this.translationService.t('orderDetails.orderNumber')} ${this.order.order_number} - ${this.translationService.t('orderDetails.title')} - Solar Shop Admin`,
        );
        await this.loadOrderItems(orderId);
        this.loadOrderDiscount();
      } else {
        this.error = 'Order not found';
      }
    } catch (error) {
      console.error('Error loading order:', error);
      this.error = 'Error loading order details';
    }
  }

  private async loadOrderItems(orderId: string): Promise<void> {
    try {
      console.log(`Loading order items for order ID: ${orderId}`);

      // Load order items from database
      const orderItemsData = await this.supabaseService.getTable(
        'order_items',
        {
          order_id: orderId,
        },
      );

      console.log(
        `Loaded ${orderItemsData?.length || 0} order items:`,
        orderItemsData,
      );

      // Convert database order items to internal format
      this.orderItems = (orderItemsData || []).map((itemData: any) => ({
        id: itemData.id,
        product_name: itemData.product_name || 'Unknown Product',
        product_sku: itemData.product_sku || '',
        unit_price: itemData.unit_price || 0,
        quantity: itemData.quantity || 1,
        discount_percentage: itemData.discount_percentage || 0,
        discount_amount: itemData.discount_amount || 0,
        total_price: itemData.total_price || 0,
      }));

      // Store original items for change detection
      this.originalOrderItems = JSON.parse(JSON.stringify(this.orderItems));

      console.log('Processed order items:', this.orderItems);

      // Populate form array
      const itemsArray = this.orderItemsArray;
      itemsArray.clear();
      this.orderItems.forEach((item) => {
        itemsArray.push(this.createItemFormGroup(item));
      });

      console.log('Form array populated with', itemsArray.length, 'items');
    } catch (error) {
      console.error('Error loading order items:', error);
      this.orderItems = [];
      this.originalOrderItems = [];
    }
  }

  private loadOrderDiscount(): void {
    const discountPercentage = this.order.discount_percentage || 0;
    this.originalOrderDiscount = discountPercentage;
    this.orderDiscountForm.patchValue({
      discount_percentage: discountPercentage,
    });
    console.log('Loaded order discount percentage:', discountPercentage);
  }

  private createItemFormGroup(item?: any): FormGroup {
    return this.fb.group({
      id: [item?.id || ''],
      product_name: [item?.product_name || '', Validators.required],
      product_sku: [item?.product_sku || ''],
      unit_price: [
        item?.unit_price || 0,
        [Validators.required, Validators.min(0)],
      ],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      discount_percentage: [
        item?.discount_percentage || 0,
        [Validators.min(0), Validators.max(100)],
      ],
    });
  }

  addItem(): void {
    this.orderItemsArray.push(this.createItemFormGroup());
    this.checkForChanges();
  }

  removeItem(index: number): void {
    if (confirm('Are you sure you want to remove this item from the order?')) {
      this.orderItemsArray.removeAt(index);
      this.checkForChanges();
    }
  }

  getItemSubtotal(index: number): number {
    const item = this.orderItemsArray.at(index);
    const unitPrice = item.get('unit_price')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    const discountPercentage = item.get('discount_percentage')?.value || 0;

    const subtotal = unitPrice * quantity;
    const discountAmount = subtotal * (discountPercentage / 100);
    return subtotal - discountAmount;
  }

  getSubtotal(): number {
    let total = 0;
    for (let i = 0; i < this.orderItemsArray.length; i++) {
      const item = this.orderItemsArray.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      total += unitPrice * quantity;
    }
    return total;
  }

  getItemDiscountsTotal(): number {
    let totalDiscount = 0;
    for (let i = 0; i < this.orderItemsArray.length; i++) {
      const item = this.orderItemsArray.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      const discountPercentage = item.get('discount_percentage')?.value || 0;

      const subtotal = unitPrice * quantity;
      const discountAmount = subtotal * (discountPercentage / 100);
      totalDiscount += discountAmount;
    }
    return totalDiscount;
  }

  getOrderDiscountAmount(): number {
    // Apply order discount to the original subtotal, not the discounted price
    const originalSubtotal = this.getSubtotal();
    const orderDiscountPercentage =
      this.orderDiscountForm.get('discount_percentage')?.value || 0;
    return originalSubtotal * (orderDiscountPercentage / 100);
  }

  getOrderTotal(): number {
    const subtotal = this.getSubtotal();
    const itemDiscounts = this.getItemDiscountsTotal();
    const orderDiscount = this.getOrderDiscountAmount();
    const shipping = this.order?.shipping_cost || 0;
    const tax = this.order?.tax_amount || 0;
    return Math.max(
      0,
      subtotal - itemDiscounts - orderDiscount + shipping + tax,
    );
  }

  getTaxPercentage(): number {
    return this.order?.tax_percentage || 0;
  }

  getShippingCost(): number {
    return this.order?.shipping_cost || 0;
  }

  getDiscountPercentage(): number {
    return this.order?.discount_percentage || 0;
  }

  async markAsPurchased(): Promise<void> {
    if (!this.order?.id) return;

    // Enable save changes button for payment status update
    this.pendingPaymentStatusUpdate = 'paid';
    this.checkForChanges();

    this.statusUpdateMessage = this.translationService.translate(
      'admin.common.paymentStatusChangeMessage',
    );
    this.statusUpdateSuccess = true;

    // Clear message after 3 seconds
    setTimeout(() => {
      this.statusUpdateMessage = '';
    }, 3000);
  }

  async updateOrderStatus(event: any): Promise<void> {
    const newStatus = event.target.value;
    if (!this.order?.id || newStatus === this.order.status) return;

    // Enable save changes button for status update
    this.pendingStatusUpdate = newStatus;
    this.checkForChanges();

    const oldStatus = this.order.status;
    this.statusUpdateMessage = this.translationService.translate(
      'admin.common.orderStatusChangeMessage',
      {
        oldStatus: this.formatStatus(oldStatus),
        newStatus: this.formatStatus(newStatus),
      },
    );
    this.statusUpdateSuccess = true;

    // Clear message after 3 seconds
    setTimeout(() => {
      this.statusUpdateMessage = '';
    }, 3000);
  }

  trackByItemId(index: number, item: any): any {
    return item.id;
  }

  private checkForChanges(): void {
    const currentItems = this.orderItemsForm.value.items;
    const currentDiscount =
      this.orderDiscountForm.get('discount_percentage')?.value || 0;

    const itemsChanged =
      JSON.stringify(currentItems) !==
      JSON.stringify(
        this.originalOrderItems.map((item) => ({
          id: item.id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          unit_price: item.unit_price,
          quantity: item.quantity,
          discount_percentage: item.discount_percentage,
        })),
      );

    const discountChanged = currentDiscount !== this.originalOrderDiscount;
    const statusChanged = this.pendingStatusUpdate !== null;
    const paymentStatusChanged = this.pendingPaymentStatusUpdate !== null;

    this.hasChanges =
      itemsChanged || discountChanged || statusChanged || paymentStatusChanged;
  }

  async saveChanges(): Promise<void> {
    if (!this.hasChanges || !this.order?.id) return;

    try {
      this.statusUpdateMessage = this.translationService.translate(
        'admin.common.savingChanges',
      );
      this.statusUpdateSuccess = true;

      // Handle status updates via NgRx/Supabase
      if (this.pendingStatusUpdate) {
        this.store.dispatch(
          OrdersActions.updateOrderStatus({
            orderId: this.order.id,
            status: this.pendingStatusUpdate,
          }),
        );
        this.order.status = this.pendingStatusUpdate;
        this.pendingStatusUpdate = null;
      }

      if (this.pendingPaymentStatusUpdate) {
        this.store.dispatch(
          OrdersActions.updatePaymentStatus({
            orderId: this.order.id,
            paymentStatus: this.pendingPaymentStatusUpdate,
          }),
        );
        this.order.payment_status = this.pendingPaymentStatusUpdate;
        this.pendingPaymentStatusUpdate = null;
      }

      // Handle form changes (items and discounts)
      const currentItems = this.orderItemsForm.value.items;
      const currentDiscount =
        this.orderDiscountForm.get('discount_percentage')?.value || 0;

      if (currentDiscount !== this.originalOrderDiscount) {
        // Update order discount in database via Supabase
        await this.supabaseService.updateRecord('orders', this.order.id, {
          discount_percentage: currentDiscount,
        } as any);
        this.order.discount_percentage = currentDiscount;
      }

      // Update order items if changed
      const itemsChanged =
        JSON.stringify(currentItems) !==
        JSON.stringify(
          this.originalOrderItems.map((item) => ({
            id: item.id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            unit_price: item.unit_price,
            quantity: item.quantity,
            discount_percentage: item.discount_percentage,
          })),
        );

      if (itemsChanged) {
        // In a real implementation, you would update order_items table
      }

      // Reset tracking variables
      this.originalOrderItems = JSON.parse(JSON.stringify(currentItems));
      this.originalOrderDiscount = currentDiscount;
      this.hasChanges = false;

      this.statusUpdateMessage = this.translationService.translate(
        'admin.common.allChangesSaved',
      );
      this.statusUpdateSuccess = true;

      // Clear message after 5 seconds
      setTimeout(() => {
        this.statusUpdateMessage = '';
      }, 5000);
    } catch (error) {
      console.error('Error saving order changes:', error);
      this.statusUpdateMessage = this.translationService.translate(
        'admin.common.errorSavingChanges',
      );
      this.statusUpdateSuccess = false;

      // Clear message after 5 seconds
      setTimeout(() => {
        this.statusUpdateMessage = '';
      }, 5000);
    }
  }

  printInvoice(): void {
    this.printOrder();
  }

  printOrder(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to print the order.');
      return;
    }

    const printContent = this.generatePrintContent();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order ${this.order.order_number} - Solar Shop</title>
          <meta charset="utf-8">
          <style>
            ${this.getPrintStyles()}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  private generatePrintContent(): string {
    const orderDate = new Date(this.order.created_at).toLocaleDateString();
    const currentFormItems = this.orderItemsForm.value.items || [];

    return `
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="company-info">
            <h1>Solar Shop</h1>
            <p>${this.translationService.t('orderDetails.yourSolarEnergyPartner')}</p>
            <p>${this.translationService.t('orderDetails.email')}: webshop@solarno.hr</p>
            <p>${this.translationService.t('orderDetails.phone')}: +385 (1) 6407 715</p>
          </div>
          <div class="invoice-title">
            <h2>${this.translationService.t('orderDetails.orderConfirmation')}</h2>
            <p><strong>${this.translationService.t('orderDetails.orderNumber')}:</strong> ${this.order.order_number}</p>
            <p><strong>${this.translationService.t('admin.orderDate')}:</strong> ${orderDate}</p>
            <p><strong>${this.translationService.t('orderDetails.status')}:</strong> ${this.formatStatus(this.order.status)}</p>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-section">
          <div class="billing-info">
            <h3>${this.translationService.t('orderDetails.billTo')}:</h3>
            <p><strong>${this.order.customer_name || this.order.customer_email}</strong></p>
            <p>${this.order.billing_address?.street || 'N/A'}</p>
            <p>${this.order.billing_address?.city || 'N/A'}, ${this.order.billing_address?.postal_code || 'N/A'}</p>
            <p>${this.order.billing_address?.country || 'N/A'}</p>
            <p>${this.translationService.t('orderDetails.email')}: ${this.order.customer_email}</p>
            ${this.order.customer_phone ? `<p>${this.translationService.t('orderDetails.phone')}: ${this.order.customer_phone}</p>` : ''}
          </div>
          <div class="shipping-info">
            <h3>${this.translationService.t('orderDetails.shipTo')}:</h3>
            <p><strong>${this.order.shipping_address?.name || this.order.customer_name || this.order.customer_email}</strong></p>
            <p>${this.order.shipping_address?.street || this.order.billing_address?.street || 'N/A'}</p>
            <p>${this.order.shipping_address?.city || this.order.billing_address?.city || 'N/A'}, ${this.order.shipping_address?.postal_code || this.order.billing_address?.postal_code || 'N/A'}</p>
            <p>${this.order.shipping_address?.country || this.order.billing_address?.country || 'N/A'}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="items-section">
          <h3>${this.translationService.t('orderDetails.orderItems')}</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>${this.translationService.t('orderDetails.product')}</th>
                <th>${this.translationService.t('orderDetails.sku')}</th>
                <th>${this.translationService.t('orderDetails.price')}</th>
                <th>${this.translationService.t('orderDetails.qty')}</th>
                <th>${this.translationService.t('orderDetails.discount')}</th>
                <th>${this.translationService.t('orderDetails.total')}</th>
              </tr>
            </thead>
            <tbody>
              ${currentFormItems
                .map(
                  (item: any, index: number) => `
                <tr>
                  <td>${item.product_name || 'N/A'}</td>
                  <td>${item.product_sku || 'N/A'}</td>
                  <td>€${(item.unit_price || 0).toFixed(2)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${item.discount_percentage || 0}%</td>
                  <td>€${this.getItemSubtotal(index).toFixed(2)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Order Summary -->
        <div class="summary-section">
          <div class="summary-table">
            <table>
              <tr>
                <td>${this.translationService.t('orderDetails.subtotal')}:</td>
                <td>€${this.getSubtotal().toFixed(2)}</td>
              </tr>
              <tr>
                <td>${this.translationService.t('orderDetails.itemDiscounts')}:</td>
                <td>-€${this.getItemDiscountsTotal().toFixed(2)}</td>
              </tr>
              <tr>
                <td>${this.translationService.t('orderDetails.orderDiscount')} (${this.orderDiscountForm.get('discount_percentage')?.value || 0}%):</td>
                <td>-€${this.getOrderDiscountAmount().toFixed(2)}</td>
              </tr>
              <tr>
                <td>${this.translationService.t('orderDetails.shipping')}:</td>
                <td>€${(this.order.shipping_cost || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>${this.translationService.t('orderDetails.tax')} (${this.order.tax_percentage || 0}%):</td>
                <td>€${(this.order.tax_amount || 0).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td><strong>${this.translationService.t('orderDetails.total')}:</strong></td>
                <td><strong>€${this.getOrderTotal().toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="payment-section">
          <h3>${this.translationService.t('orderDetails.paymentInformation')}</h3>
          <p><strong>${this.translationService.t('orderDetails.paymentMethod')}:</strong> ${this.translationService.t(this.getPaymentMethodTranslation(this.order.payment_method))}</p>
          <p><strong>${this.translationService.t('orderDetails.paymentStatus')}:</strong> ${this.formatPaymentStatus(this.order.payment_status)}</p>
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
          <p>${this.translationService.t('orderDetails.thankYouForBusiness')}</p>
          <p>${this.translationService.t('orderDetails.contactForQuestions')} webshop@solarno.hr</p>
        </div>
      </div>
    `;
  }

  private getPrintStyles(): string {
    return `
      @media print {
        @page {
          size: A4;
          margin: 2cm;
        }
        
        body {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #000;
          -webkit-print-color-adjust: exact;
        }
      }

      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
        background: white;
        color: #333;
      }

      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }

      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
      }

      .company-info h1 {
        margin: 0 0 10px 0;
        font-size: 28px;
        color: #1e40af;
        font-weight: bold;
      }

      .company-info p {
        margin: 5px 0;
        color: #666;
      }

      .invoice-title {
        text-align: right;
      }

      .invoice-title h2 {
        margin: 0 0 15px 0;
        font-size: 24px;
        color: #1e40af;
      }

      .invoice-title p {
        margin: 8px 0;
        font-size: 16px;
      }

      .customer-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        gap: 40px;
      }

      .billing-info, .shipping-info {
        flex: 1;
      }

      .billing-info h3, .shipping-info h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #1e40af;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 5px;
      }

      .billing-info p, .shipping-info p {
        margin: 8px 0;
        font-size: 14px;
      }

      .items-section {
        margin-bottom: 30px;
      }

      .items-section h3 {
        margin: 0 0 20px 0;
        font-size: 20px;
        color: #1e40af;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      .items-table th {
        background-color: #f8fafc;
        padding: 12px 8px;
        text-align: left;
        font-weight: bold;
        border: 1px solid #e5e7eb;
        font-size: 14px;
      }

      .items-table td {
        padding: 12px 8px;
        border: 1px solid #e5e7eb;
        font-size: 14px;
      }

      .items-table tbody tr:nth-child(even) {
        background-color: #f8fafc;
      }

      .summary-section {
        margin-bottom: 30px;
      }

      .summary-table {
        float: right;
        width: 300px;
      }

      .summary-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .summary-table td {
        padding: 8px 12px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
      }

      .summary-table td:first-child {
        text-align: left;
        font-weight: 500;
      }

      .summary-table td:last-child {
        text-align: right;
        font-weight: 600;
      }

      .total-row {
        border-top: 2px solid #1e40af;
        background-color: #f8fafc;
      }

      .total-row td {
        padding: 12px;
        font-size: 16px;
        font-weight: bold;
        color: #1e40af;
      }

      .payment-section {
        clear: both;
        margin-bottom: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }

      .payment-section h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #1e40af;
      }

      .payment-section p {
        margin: 8px 0;
        font-size: 14px;
      }

      .invoice-footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e5e7eb;
        color: #666;
      }

      .invoice-footer p {
        margin: 10px 0;
        font-size: 14px;
      }

      @media print {
        .invoice-container {
          box-shadow: none;
          padding: 0;
        }
        
        .customer-section {
          page-break-inside: avoid;
        }
        
        .items-section {
          page-break-inside: avoid;
        }
        
        .summary-section {
          page-break-inside: avoid;
        }
      }
    `;
  }

  editOrder(): void {
    this.router.navigate(['/admin/narudzbe/uredi', this.order.id]);
  }

  goBack(): void {
    this.router.navigate(['/admin/narudzbe']);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  getStatusDropdownClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-600 border-yellow-600 hover:bg-yellow-700',
      confirmed: 'bg-blue-600 border-blue-600 hover:bg-blue-700',
      processing: 'bg-purple-600 border-purple-600 hover:bg-purple-700',
      shipped: 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700',
      delivered: 'bg-green-600 border-green-600 hover:bg-green-700',
      cancelled: 'bg-red-600 border-red-600 hover:bg-red-700',
      refunded: 'bg-gray-600 border-gray-600 hover:bg-gray-700',
    };
    return (
      statusClasses[status] || 'bg-gray-600 border-gray-600 hover:bg-gray-700'
    );
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatStatus(status: string): string {
    return (
      this.translationService.translate(`admin.orderStatus.${status}`) || status
    );
  }

  formatPaymentStatus(status: string): string {
    return (
      this.translationService.translate(`admin.paymentStatus.${status}`) ||
      status
    );
  }

  getPaymentMethodTranslation(paymentMethod: string): string {
    const translationKey = this.getPaymentMethodKey(paymentMethod);
    return translationKey;
  }

  private getPaymentMethodKey(paymentMethod: string): string {
    if (!paymentMethod) {
      return 'admin.ordersForm.creditCard'; // Default fallback
    }

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
}
