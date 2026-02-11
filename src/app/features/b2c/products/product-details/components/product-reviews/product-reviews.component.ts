import { Component, Input, OnInit, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../../../shared/services/translation.service';
import { SuccessModalComponent } from '../../../../../../shared/components/modals/success-modal/success-modal.component';
import { SupabaseService } from '../../../../../../services/supabase.service';
import { selectCurrentUser } from '../../../../../../core/auth/store/auth.selectors';
import { WriteReviewModalComponent } from '../../../../../../shared/components/modals/write-review-modal/write-review-modal.component';
import { ProductDetailsActions, ProductReview } from '../../store/product-details.actions';
import {
  selectProductReviews,
  selectProductReviewsLoading,
  selectProductReviewsError,
  selectAverageRating,
  selectReviewCount,
  selectIsMarkingHelpful
} from '../../store/product-details.selectors';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule, 
    TranslatePipe, 
    WriteReviewModalComponent, 
    SuccessModalComponent
  ],
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent implements OnInit, OnChanges {
  @Input() productId!: string;
  @Input() productName?: string;
  @Input() preselectedOrderId?: string;

  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);

  // Store observables
  reviews$ = this.store.select(selectProductReviews);
  reviewsLoading$ = this.store.select(selectProductReviewsLoading);
  reviewsError$ = this.store.select(selectProductReviewsError);
  averageRating$ = this.store.select(selectAverageRating);
  reviewCount$ = this.store.select(selectReviewCount);

  currentUser$ = this.store.select(selectCurrentUser);
  canWriteReview = false;
  userId = '';

  // Modal properties
  showReviewModal = false;
  showSuccessModal = false;
  successModalTitle = '';
  successModalMessage = '';

  constructor() {
    // Subscribe to user changes
    this.currentUser$.subscribe((user) => {
      this.userId = user?.id || '';
      // Don't call checkIfUserCanWriteReview here - wait for productId to be available
    });
  }

  ngOnInit(): void {
    // Reviews are loaded automatically when product is loaded via effects
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if productId has changed and is now available
    if (changes['productId'] && this.productId && this.userId) {
      console.log('ProductId changed to:', this.productId, 'UserId:', this.userId); // Debug log
      this.checkIfUserCanWriteReview();
    }
  }

  getStarArray(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(0.5);
    }

    // Add empty stars to complete 5 stars
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(0);
    }

    return stars;
  }

  getRatingCount(rating: number): number {
    let count = 0;
    this.reviews$.subscribe(reviews => {
      count = reviews.filter(review => review.rating === rating).length;
    }).unsubscribe();
    return count;
  }

  getRatingPercentage(rating: number): number {
    const count = this.getRatingCount(rating);
    let totalCount = 0;
    this.reviewCount$.subscribe(total => {
      totalCount = total;
    }).unsubscribe();
    return totalCount > 0 ? (count / totalCount) * 100 : 0;
  }

  isMarkingHelpful(reviewId: string): boolean {
    let isMarking = false;
    this.store.select(selectIsMarkingHelpful(reviewId)).subscribe(marking => {
      isMarking = marking;
    }).unsubscribe();
    return isMarking;
  }

  markHelpful(reviewId: string): void {
    this.store.dispatch(ProductDetailsActions.markReviewHelpful({ reviewId, productId: this.productId }));
  }

  reportReview(reviewId: string): void {
    // In a real app, this would show a report modal or send a report
  }

  openWriteReview(): void {
    if (this.canWriteReview) {
      this.showReviewModal = true;
    } else {
      this.showSuccess(
        this.translationService.translate('reviewsSection.cannotWriteReview'),
        this.translationService.translate('reviewsSection.mustPurchaseFirst')
      );
    }
  }

  onReviewSubmitted(reviewData: any): void {
    this.showReviewModal = false;
    this.showSuccess(
      this.translationService.translate('reviewsSection.reviewSubmitted'),
      this.translationService.translate('reviewsSection.reviewSubmittedMessage')
    );
    // Reload reviews to include the new one (if approved)
    this.reloadReviews();
  }

  onReviewCancelled(): void {
    this.showReviewModal = false;
  }

  reloadReviews(): void {
    this.store.dispatch(ProductDetailsActions.loadProductReviews({ productId: this.productId }));
  }

  private async checkIfUserCanWriteReview(): Promise<void> {
    try {
      // We already have userId from constructor subscription, no need to fetch user again
      if (!this.userId) {
        console.log('No userId available, setting canWriteReview to false'); // Debug log
        this.canWriteReview = false;
        return;
      }

      if (!this.productId) {
        console.log('No productId available, setting canWriteReview to false'); // Debug log
        this.canWriteReview = false;
        return;
      }

      console.log('Checking if user can write review for userId:', this.userId, 'productId:', this.productId); // Debug log

      // Check if user has purchased this product and order is delivered
      const { data: orderItems, error } = await this.supabaseService.client
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          orders!inner(
            id,
            user_id,
            status
          )
        `)
        .eq('product_id', this.productId)
        .eq('orders.user_id', this.userId)
        .eq('orders.status', 'delivered');

      if (error) {
        console.error('Error checking user order items:', error);
        this.canWriteReview = false;
        return;
      }

      console.log('Order items found:', orderItems?.length || 0); // Debug log

      if (!orderItems || orderItems.length === 0) {
        this.canWriteReview = false;
        return;
      }

      // Check if user has already reviewed this product for any of these order items
      const orderItemIds = orderItems.map(item => item.id);
      const { data: existingReviews } = await this.supabaseService.client
        .from('reviews')
        .select('order_item_id')
        .eq('user_id', this.userId)
        .eq('product_id', this.productId)
        .in('order_item_id', orderItemIds);

      console.log('Existing reviews found:', existingReviews?.length || 0); // Debug log

      // User can write review if they have order items but haven't reviewed all of them
      this.canWriteReview = existingReviews ? existingReviews.length < orderItems.length : true;
      console.log('Final canWriteReview result:', this.canWriteReview); // Debug log
    } catch (error) {
      console.error('Error checking if user can write review:', error);
      this.canWriteReview = false;
    }
  }

  private showSuccess(title: string, message: string): void {
    this.successModalTitle = title;
    this.successModalMessage = message;
    this.showSuccessModal = true;
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal = false;
    this.successModalTitle = '';
    this.successModalMessage = '';
  }

  loadMoreReviews(): void {
    // Implementation for loading more reviews
  }

  trackByReviewId(index: number, review: ProductReview): string {
    return review.id;
  }
} 