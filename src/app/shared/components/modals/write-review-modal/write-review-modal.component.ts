import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { ReviewStatus } from '../../../models/review.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { UserOrder } from '../../../models/user-order.model';

@Component({
  selector: 'app-write-review-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './write-review-modal.component.html',
  styleUrls: ['./write-review-modal.component.scss'],
})
export class WriteReviewModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() productId!: string;
  @Input() userId!: string;
  @Input() preselectedOrderId?: string;

  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);

  reviewForm: FormGroup;
  stars = Array(5).fill(0);
  rating = 0;
  hoverRating = 0;
  isSubmitting = false;

  userOrders: UserOrder[] = [];
  selectedOrder: UserOrder | null = null;
  selectedOrderItemIds: string[] = [];
  allProductsSelected = false;

  constructor() {
    this.reviewForm = this.fb.group({
      selectedOrderId: ['', Validators.required],
      selectedOrderItemIds: [[], Validators.required],
      rating: [0, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      comment: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    // Don't load orders here - wait for isOpen to be true
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Load user orders when modal opens
    if (changes['isOpen'] && this.isOpen && this.userId) {
      console.log('Modal opened, loading user orders for userId:', this.userId);
      this.loadUserOrders();
    }
  }

  async loadUserOrders(): Promise<void> {
    try {
      console.log('Loading user orders...'); // Debug log
      // Load user's delivered orders with order items
      const { data: orders, error } = await this.supabaseService.client
        .from('orders')
        .select(
          `
          id,
          order_number,
          order_date,
          status,
          order_items(
            id,
            product_id,
            product_name,
            product_image_url,
            quantity,
            unit_price
          )
        `,
        )
        .eq('user_id', this.userId)
        .eq('status', 'delivered')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      console.log('Orders loaded:', orders?.length || 0); // Debug log

      // Check which order items already have reviews
      const { data: existingReviews } = await this.supabaseService.client
        .from('reviews')
        .select('order_item_id')
        .eq('user_id', this.userId);

      this.userOrders = (orders || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        order_date: order.order_date,
        status: order.status,
        items: order.order_items.map((item: any) => ({
          ...item,
          hasReview:
            existingReviews?.some(
              (review: any) => review.order_item_id === item.id,
            ) || false,
        })),
      }));

      console.log('User orders processed:', this.userOrders.length); // Debug log

      // If preselected order, set it
      if (this.preselectedOrderId) {
        this.selectedOrder =
          this.userOrders.find(
            (order) => order.id === this.preselectedOrderId,
          ) || null;
        if (this.selectedOrder) {
          this.reviewForm.patchValue({
            selectedOrderId: this.preselectedOrderId,
          });
          this.onOrderSelected({ target: { value: this.preselectedOrderId } });
        }
      }
    } catch (error) {
      console.error('Error loading user orders:', error);
    }
  }

  onOrderSelected(event: any): void {
    const orderId = event.target.value;
    this.selectedOrder =
      this.userOrders.find((order) => order.id === orderId) || null;
    this.selectedOrderItemIds = [];
    this.allProductsSelected = false;

    if (this.selectedOrder) {
      // Auto-select order items that don't have reviews yet
      const availableOrderItems = this.selectedOrder.items
        .filter((item) => !item.hasReview)
        .map((item) => item.id);

      this.selectedOrderItemIds = availableOrderItems;
      this.allProductsSelected = availableOrderItems.length > 0;

      this.reviewForm.patchValue({
        selectedOrderItemIds: this.selectedOrderItemIds,
      });
    }
  }

  toggleOrderItem(orderItemId: string, event: any): void {
    if (event.target.checked) {
      this.selectedOrderItemIds.push(orderItemId);
    } else {
      this.selectedOrderItemIds = this.selectedOrderItemIds.filter(
        (id) => id !== orderItemId,
      );
    }
    this.allProductsSelected =
      this.selectedOrderItemIds.length ===
      this.selectedOrder?.items.filter((item) => !item.hasReview).length;
    this.reviewForm.patchValue({
      selectedOrderItemIds: this.selectedOrderItemIds,
    });
  }

  toggleAllProducts(event: any): void {
    this.allProductsSelected = event.target.checked;
    if (this.allProductsSelected && this.selectedOrder) {
      this.selectedOrderItemIds = this.selectedOrder.items
        .filter((item) => !item.hasReview)
        .map((item) => item.id);
    } else {
      this.selectedOrderItemIds = [];
    }
    this.reviewForm.patchValue({
      selectedOrderItemIds: this.selectedOrderItemIds,
    });
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  setRating(rating: number): void {
    this.rating = rating;
    this.reviewForm.patchValue({ rating });
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  async onSubmit(): Promise<void> {
    if (this.reviewForm.invalid || this.isSubmitting) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.reviewForm.value;
      const orderId = this.preselectedOrderId || formValue.selectedOrderId;
      const orderItemIds = formValue.selectedOrderItemIds;

      const reviews = [];

      for (const orderItemId of orderItemIds) {
        // Get the order item to get the product_id
        const { data: orderItem } = await this.supabaseService.client
          .from('order_items')
          .select('product_id')
          .eq('id', orderItemId)
          .single();

        if (!orderItem) continue;

        const reviewData = {
          user_id: this.userId,
          product_id: orderItem.product_id,
          order_id: orderId,
          order_item_id: orderItemId,
          rating: formValue.rating,
          title: formValue.title,
          comment: formValue.comment,
          is_verified_purchase: true,
          is_approved: false,
          status: 'pending' as ReviewStatus,
          helpful_count: 0,
          reported_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const createdReview = await this.supabaseService.createRecord(
          'reviews',
          reviewData,
        );
        if (createdReview) {
          reviews.push(createdReview);
        }
      }

      if (reviews.length > 0) {
        this.submitted.emit({
          reviews,
          orderId,
          orderItemIds,
          rating: formValue.rating,
          title: formValue.title,
          comment: formValue.comment,
        });
        this.resetForm();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      // You might want to show an error message here
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.reviewForm.reset();
    this.rating = 0;
    this.hoverRating = 0;
    this.isSubmitting = false;
    this.selectedOrder = null;
    this.selectedOrderItemIds = [];
    this.allProductsSelected = false;
  }
}
