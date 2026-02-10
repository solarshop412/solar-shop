import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SuccessModalComponent } from '../../../../shared/components/modals/success-modal/success-modal.component';
import { TranslationService } from '../../../../shared/services/translation.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, fromEvent, merge, EMPTY, from } from 'rxjs';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe, SuccessModalComponent],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  private translationService = inject(TranslationService);

  orderForm: FormGroup | null = null;
  loading = false;
  isEditMode = false;
  orderId: string | null = null;

  // Product search properties
  searchResults: any[] = [];
  isSearching = false;
  activeSearchIndex = -1;

  // User lookup properties
  foundUser: any = null;
  isLookingUpUser = false;

  // Success modal properties
  showSuccessModal = false;
  successModalTitle = '';
  successModalMessage = '';

  constructor() {
    this.orderForm = this.fb.group({
      order_number: ['', Validators.required],
      customer_email: ['', [Validators.required, Validators.email]],
      customer_name: [''],
      customer_phone: [''],
      order_date: ['', Validators.required],
      status: ['pending', Validators.required],
      payment_status: ['pending', Validators.required],
      payment_method: [''],
      shipping_address: [''],
      billing_address: [''],
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
      discount_amount: [0, [Validators.min(0)]],
      shipping_cost: [0, [Validators.min(0)]],
      tax_percentage: [0, [Validators.min(0), Validators.max(100)]],
      tax_amount: [0, [Validators.min(0)]],
      is_b2b: [false],
      notes: [''],
      order_items: this.fb.array([])
    });
  }

  get orderItems(): FormArray {
    return this.orderForm?.get('order_items') as FormArray;
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.isEditMode = true;
      this.orderId = orderId;
      this.loadOrder();
    } else {
      // Add one initial item for new orders
      this.addOrderItem();
    }

    // Set default order date to now for new orders
    if (!this.isEditMode) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      this.orderForm?.patchValue({ order_date: localDateTime });
    }

    // Set up email field listener for user lookup
    this.setupEmailListener();

    // Set page title
    this.title.setTitle(this.translationService.translate('admin.ordersForm.title'));
  }

  createOrderItem(): FormGroup {
    return this.fb.group({
      product_id: [''],
      product_name: ['', Validators.required],
      product_sku: [''],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
      discount_amount: [0, [Validators.min(0)]]
    });
  }

  addOrderItem(): void {
    this.orderItems.push(this.createOrderItem());
  }

  removeOrderItem(index: number): void {
    this.orderItems.removeAt(index);
  }

  getItemSubtotal(index: number): number {
    const item = this.orderItems.at(index);
    const unitPrice = item.get('unit_price')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    const discountPercentage = item.get('discount_percentage')?.value || 0;

    const subtotal = unitPrice * quantity;
    const discountAmount = subtotal * (discountPercentage / 100);
    return subtotal - discountAmount;
  }

  getOrderSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.orderItems.length; i++) {
      const item = this.orderItems.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      subtotal += unitPrice * quantity;
    }
    return subtotal;
  }

  getItemDiscountsTotal(): number {
    let totalDiscount = 0;
    for (let i = 0; i < this.orderItems.length; i++) {
      const item = this.orderItems.at(i);
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
    const subtotalAfterItemDiscounts = this.getOrderSubtotal() - this.getItemDiscountsTotal();
    const discountPercentage = this.orderForm?.get('discount_percentage')?.value || 0;
    return subtotalAfterItemDiscounts * (discountPercentage / 100);
  }

  getShippingCost(): number {
    return this.orderForm?.get('shipping_cost')?.value || 0;
  }

  getTaxAmount(): number {
    const subtotalAfterDiscounts = this.getOrderSubtotal() - this.getItemDiscountsTotal() - this.getOrderDiscountAmount() + this.getShippingCost();
    const taxPercentage = this.orderForm?.get('tax_percentage')?.value || 0;
    return subtotalAfterDiscounts * (taxPercentage / 100);
  }

  getOrderTotal(): number {
    const subtotal = this.getOrderSubtotal();
    const itemDiscounts = this.getItemDiscountsTotal();
    const orderDiscount = this.getOrderDiscountAmount();
    const shipping = this.getShippingCost();
    const tax = this.getTaxAmount();
    return Math.max(0, subtotal - itemDiscounts - orderDiscount + shipping + tax);
  }

  // User lookup method
  private async findUserByEmail(email: string): Promise<string | null> {
    if (!email || !email.includes('@')) {
      return null;
    }

    try {
      console.log(`Looking up user by email: ${email}`);
      const matchingUser = await this.supabaseService.findAuthUserByEmail(email);

      if (matchingUser) {
        console.log(`Found matching user for email ${email}:`, matchingUser.id);
        return matchingUser.id;
      } else {
        console.log(`No matching user found for email: ${email}`);
        return null;
      }
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  private setupEmailListener(): void {
    if (!this.orderForm) return;

    const emailControl = this.orderForm.get('customer_email');
    if (emailControl) {
      emailControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          if (!email || !email.includes('@')) {
            this.foundUser = null;
            this.isLookingUpUser = false;
            return EMPTY;
          }

          this.isLookingUpUser = true;
          return from(this.lookupUserForDisplay(email));
        }),
        catchError(error => {
          console.error('Error in email lookup:', error);
          this.isLookingUpUser = false;
          return EMPTY;
        })
      ).subscribe();
    }
  }

  private async lookupUserForDisplay(email: string): Promise<void> {
    try {
      // Use the database function to find user by email
      const authUser = await this.supabaseService.findAuthUserByEmail(email);

      if (authUser && authUser.profile) {
        this.foundUser = {
          user_id: authUser.id,
          email: authUser.email,
          first_name: authUser.profile.first_name,
          last_name: authUser.profile.last_name,
          full_name: authUser.profile.full_name,
          role: authUser.profile.role
        };
      } else {
        this.foundUser = null;
      }
    } catch (error) {
      console.error('Error looking up user for display:', error);
      this.foundUser = null;
    } finally {
      this.isLookingUpUser = false;
    }
  }

  // Product search methods
  async searchProducts(query: string, itemIndex: number): Promise<void> {
    if (!query || query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    try {
      const products = await this.supabaseService.getProducts({ search: query, limit: 10 });
      this.searchResults = products || [];
      this.activeSearchIndex = itemIndex;
    } catch (error) {
      console.error('Error searching products:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
    }
  }

  selectProduct(product: any, itemIndex: number): void {
    const item = this.orderItems.at(itemIndex);
    if (item) {
      item.patchValue({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku || '',
        unit_price: product.price || 0
      });
    }
    this.searchResults = [];
    this.activeSearchIndex = -1;
  }

  onProductInputFocus(itemIndex: number): void {
    this.activeSearchIndex = itemIndex;
  }

  onProductInputBlur(itemIndex: number): void {
    // Add a small delay to allow click on search results
    setTimeout(() => {
      if (this.activeSearchIndex === itemIndex) {
        this.searchResults = [];
        this.activeSearchIndex = -1;
      }
    }, 200);
  }

  onProductInputChange(query: string, itemIndex: number): void {
    this.searchProducts(query, itemIndex);
  }

  private async loadOrder(): Promise<void> {
    if (!this.orderId || !this.orderForm) return;

    this.loading = true;
    try {
      console.log('Loading order with ID:', this.orderId);
      const data = await this.supabaseService.getTableById('orders', this.orderId);
      if (data) {
        console.log('Order loaded successfully:', data);

        // Format dates for datetime-local inputs and addresses for display
        const formData = {
          ...data,
          order_date: data.order_date ? new Date(data.order_date).toISOString().slice(0, 16) : '',
          shipping_address: this.formatAddressForDisplay(data.shipping_address),
          billing_address: this.formatAddressForDisplay(data.billing_address)
        };

        console.log('Formatted form data:', formData);
        this.orderForm.patchValue(formData);

        // Load order items
        await this.loadOrderItems();
      } else {
        console.error('Order not found with ID:', this.orderId);
        alert('Order not found. You will be redirected to the orders list.');
        this.router.navigate(['/admin/narudzbe']);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Error loading order: ' + (error as any).message);
      this.router.navigate(['/admin/narudzbe']);
    } finally {
      this.loading = false;
    }
  }

  private async loadOrderItems(): Promise<void> {
    if (!this.orderId) return;

    try {
      const orderItems = await this.supabaseService.getTable('order_items', { order_id: this.orderId });

      // Clear existing items
      while (this.orderItems.length !== 0) {
        this.orderItems.removeAt(0);
      }

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const orderItemForm = this.createOrderItem();
          orderItemForm.patchValue({
            product_id: item.product_id || '',
            product_name: item.product_name || '',
            product_sku: item.product_sku || '',
            unit_price: item.unit_price || 0,
            quantity: item.quantity || 1,
            discount_percentage: (item as any).discount_percentage || 0,
            discount_amount: (item as any).discount_amount || 0
          });
          this.orderItems.push(orderItemForm);
        }
      } else {
        // Add one empty item for editing
        this.addOrderItem();
      }
    } catch (error) {
      console.error('Error loading order items:', error);
      // Add one empty item if loading fails
      this.addOrderItem();
    }
  }

  async onSave(): Promise<void> {
    if (!this.orderForm || this.orderForm.invalid) {
      this.orderForm?.markAllAsTouched();
      return;
    }

    this.loading = true;
    try {
      const formData = { ...this.orderForm.value };

      // Remove order_items from the order data (it should be saved separately)
      const orderItems = formData.order_items;
      delete formData.order_items;

      // Convert datetime-local back to ISO string
      if (formData.order_date) {
        formData.order_date = new Date(formData.order_date).toISOString();
      }

      // Convert address strings back to JSONB objects
      if (formData.shipping_address) {
        formData.shipping_address = this.parseAddressForStorage(formData.shipping_address);
      }

      if (formData.billing_address) {
        formData.billing_address = this.parseAddressForStorage(formData.billing_address);
      }

      // Calculate and set amounts from percentages
      formData.subtotal = this.getOrderSubtotal();
      formData.discount_amount = this.getOrderDiscountAmount();
      formData.tax_amount = this.getTaxAmount();
      formData.total_amount = this.getOrderTotal();

      // Find matching user by email and set user_id
      formData.user_id = await this.findUserByEmail(formData.customer_email);

      // Clean up form data - ensure all numeric fields are properly typed
      const cleanedFormData = {
        ...formData,
        subtotal: Number(formData.subtotal) || 0,
        discount_amount: Number(formData.discount_amount) || 0,
        tax_amount: Number(formData.tax_amount) || 0,
        total_amount: Number(formData.total_amount) || 0,
        shipping_cost: Number(formData.shipping_cost) || 0,
        discount_percentage: Number(formData.discount_percentage) || 0,
        tax_percentage: Number(formData.tax_percentage) || 0,
        is_b2b: Boolean(formData.is_b2b)
      };

      console.log('Cleaned form data for order save:', cleanedFormData);

      // Handle empty payment method - ensure valid values only
      if (!cleanedFormData.payment_method || cleanedFormData.payment_method === '') {
        delete cleanedFormData.payment_method; // Remove the field entirely if empty
      } else {
        // Ensure the payment method is one of the allowed values
        const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];
        if (!validPaymentMethods.includes(cleanedFormData.payment_method)) {
          console.error('Invalid payment method:', cleanedFormData.payment_method);
          delete cleanedFormData.payment_method;
        }
      }

      // Debug: Log the data being saved
      console.log('Order data being saved:', cleanedFormData);
      console.log('Payment method value:', cleanedFormData.payment_method);

      let savedOrder: any;

      if (this.isEditMode && this.orderId) {
        // Update existing order
        console.log('Updating order with ID:', this.orderId);
        console.log('Update data:', formData);

        try {
          // First verify the order exists
          const existingOrder = await this.supabaseService.getTableById('orders', this.orderId);
          if (!existingOrder) {
            throw new Error(`Order with ID ${this.orderId} not found`);
          }
          console.log('Existing order found:', existingOrder);

          savedOrder = await this.supabaseService.updateRecord('orders', this.orderId, cleanedFormData);
          console.log('Order updated successfully:', savedOrder);

          // Delete existing order items and create new ones
          await this.deleteExistingOrderItems();
          await this.saveOrderItems(this.orderId, orderItems);

          this.successModalTitle = this.translationService.translate('common.success');
          this.successModalMessage = this.translationService.translate('admin.orderUpdatedSuccessfully');
          this.showSuccessModal = true;
        } catch (updateError: any) {
          console.error('Error updating order:', updateError);
          throw new Error(`Failed to update order: ${updateError.message}`);
        }
      } else {
        // Create new order
        savedOrder = await this.supabaseService.createRecord('orders', cleanedFormData);

        if (savedOrder && savedOrder.id) {
          // First, check and decrement stock for all items
          console.log('Processing stock adjustment for new order items...');
          const stockAdjustmentSuccess = await this.supabaseService.processOrderStockAdjustment(orderItems, true);

          if (!stockAdjustmentSuccess) {
            // Delete the order if stock adjustment fails
            await this.supabaseService.deleteRecord('orders', savedOrder.id);
            throw new Error('Insufficient stock for one or more items. Order not created.');
          }

          // Save order items
          await this.saveOrderItems(savedOrder.id, orderItems);
        }

        this.successModalTitle = this.translationService.translate('common.success');
        this.successModalMessage = this.translationService.translate('admin.orderCreatedSuccessfully');
        this.showSuccessModal = true;
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order: ' + (error as any).message);
    } finally {
      this.loading = false;
    }
  }

  private async deleteExistingOrderItems(): Promise<void> {
    if (!this.orderId) return;

    try {
      // Get existing order items
      const existingItems = await this.supabaseService.getTable('order_items', { order_id: this.orderId });

      // Delete each item
      if (existingItems && existingItems.length > 0) {
        for (const item of existingItems) {
          await this.supabaseService.deleteRecord('order_items', item.id);
        }
      }
    } catch (error) {
      console.error('Error deleting existing order items:', error);
    }
  }

  private async saveOrderItems(orderId: string, orderItems: any[]): Promise<void> {
    if (!orderItems || orderItems.length === 0) return;

    try {
      for (const item of orderItems) {
        if (item.product_name && item.unit_price && item.quantity) {
          const unitPrice = parseFloat(item.unit_price) || 0;
          const quantity = parseInt(item.quantity) || 1;
          const discountPercentage = parseFloat(item.discount_percentage) || 0;

          // Calculate amounts
          const itemSubtotal = unitPrice * quantity;
          const discountAmount = itemSubtotal * (discountPercentage / 100);
          const totalPrice = itemSubtotal - discountAmount;

          const orderItemData = {
            order_id: orderId,
            product_id: item.product_id || null,
            product_name: item.product_name,
            product_sku: item.product_sku || null,
            unit_price: unitPrice,
            quantity: quantity,
            total_price: totalPrice,
            discount_percentage: discountPercentage,
            discount_amount: discountAmount
          };

          await this.supabaseService.createRecord('order_items', orderItemData);
        }
      }
    } catch (error) {
      console.error('Error saving order items:', error);
      throw error;
    }
  }

  onSuccessModalClose(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/admin/narudzbe']);
  }

  /**
   * Formats a JSONB address object into a readable string for display
   */
  private formatAddressForDisplay(addressObj: any): string {
    if (!addressObj || typeof addressObj !== 'object') {
      return '';
    }

    const address = addressObj as {
      firstName?: string;
      lastName?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      phone?: string;
    };

    const parts = [
      address.firstName && address.lastName ? `${address.firstName} ${address.lastName}` : '',
      address.addressLine1 || '',
      address.addressLine2 || '',
      [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
      address.country || '',
      address.phone || ''
    ].filter(Boolean);

    return parts.join('\n');
  }

  /**
   * Parses a formatted address string back into a JSONB object for storage
   */
  private parseAddressForStorage(addressString: string): any {
    if (!addressString || typeof addressString !== 'string') {
      return null;
    }

    const lines = addressString.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return null;
    }

    // Try to parse the address structure
    const address: any = {};

    // First line might be name
    if (lines[0] && lines[0].includes(' ')) {
      const nameParts = lines[0].split(' ');
      address.firstName = nameParts[0];
      address.lastName = nameParts.slice(1).join(' ');
      lines.shift(); // Remove the name line
    }

    // Next lines might be address lines
    if (lines.length > 0) {
      address.addressLine1 = lines[0];
      lines.shift();
    }

    if (lines.length > 0) {
      address.addressLine2 = lines[0];
      lines.shift();
    }

    // Next line might be city, state, postal code
    if (lines.length > 0) {
      const cityStatePostal = lines[0];
      const parts = cityStatePostal.split(',').map(part => part.trim());
      if (parts.length >= 1) address.city = parts[0];
      if (parts.length >= 2) address.state = parts[1];
      if (parts.length >= 3) address.postalCode = parts[2];
      lines.shift();
    }

    // Next line might be country
    if (lines.length > 0) {
      address.country = lines[0];
      lines.shift();
    }

    // Last line might be phone
    if (lines.length > 0) {
      address.phone = lines[0];
    }

    return address;
  }
} 