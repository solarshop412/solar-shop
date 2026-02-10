import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { selectCurrentUser, selectAuthLoading, selectAuthError } from '../../../core/auth/store/auth.selectors';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { User, UserAddress } from '../../../shared/models/user.model';
import { Actions, ofType } from '@ngrx/effects';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Order } from '../../../shared/models/order.model';
import { Review } from '../../../shared/models/review.model';
import { SupabaseService } from '../../../services/supabase.service';
import * as WishlistActions from '../wishlist/store/wishlist.actions';
import { selectWishlistItems, selectWishlistLoading, selectWishlistError } from '../wishlist/store/wishlist.selectors';
import { selectUserOrders, selectUserOrdersLoading, selectUserReviews, selectUserReviewsLoading } from '../../admin/orders/store/orders.selectors';
import * as OrdersActions from '../../admin/orders/store/orders.actions';
import { WriteReviewModalComponent } from '../../../shared/components/modals/write-review-modal/write-review-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    TranslatePipe, 
    WriteReviewModalComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private actions$ = inject(Actions);
  private supabaseService = inject(SupabaseService);

  currentUser$: Observable<User | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  activeTab: 'user-info' | 'billing-shipping' | 'my-orders' | 'my-wishlist' | 'my-reviews' | 'account' = 'user-info';
  userInfoForm: FormGroup;
  passwordForm: FormGroup;
  showSuccessMessage = false;
  showPasswordSuccessMessage = false;
  passwordError = '';

  orders$: Observable<Order[]> = this.store.select(selectUserOrders);
  ordersLoading$: Observable<boolean> = this.store.select(selectUserOrdersLoading);

  reviews$: Observable<Review[]> = this.store.select(selectUserReviews);
  reviewsLoading$: Observable<boolean> = this.store.select(selectUserReviewsLoading);

  wishlist$ = this.store.select(selectWishlistItems);
  wishlistLoading$ = this.store.select(selectWishlistLoading);
  wishlistError$ = this.store.select(selectWishlistError);

  showReviewModal = false;
  selectedOrderId = '';
  selectedProductId = '';

  private orderReviewStatusCache = new Map<string, { status: string; missingCount: number }>();

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);

    this.userInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [''],
      gender: ['']
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  ngOnInit(): void {
    // Check for tab query parameter
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as any;
      }
    });

    this.store.dispatch(AuthActions.loadUserProfile());
    this.store.dispatch(WishlistActions.loadWishlist());

    this.currentUser$.pipe(
      filter(user => !!user?.email),
      take(1)
    ).subscribe(user => {
      if (user) {
        this.store.dispatch(OrdersActions.loadUserOrders({ userEmail: user.email }));
        this.store.dispatch(OrdersActions.loadUserReviews({ userId: user.id }));
      }
    });

    this.orders$.subscribe(orders => {
      console.log('Profile Component: User orders updated:', orders?.length || 0, orders);
      // Update review status when orders are loaded
      this.updateOrderReviewStatus();
    });

    this.reviews$.subscribe(reviews => {
      console.log('Profile Component: User reviews updated:', reviews?.length || 0, reviews);
      // Update review status when reviews are loaded
      this.updateOrderReviewStatus();
    });

    this.currentUser$.subscribe(user => {
      if (user) {
        this.userInfoForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || ''
        });
      }
    });

    this.actions$.pipe(
      ofType(AuthActions.updateUserProfileSuccess)
    ).subscribe(() => {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    });
  }

  setActiveTab(tab: 'user-info' | 'billing-shipping' | 'my-orders' | 'my-wishlist' | 'my-reviews' | 'account'): void {
    this.activeTab = tab;
    this.showSuccessMessage = false;
    this.showPasswordSuccessMessage = false;
    this.passwordError = '';

    if (tab === 'my-orders') {
      this.currentUser$.pipe(
        filter(user => !!user?.email),
        take(1)
      ).subscribe(user => {
        if (user?.email) {
          this.store.dispatch(OrdersActions.loadUserOrders({ userEmail: user.email }));
        }
      });
    } else if (tab === 'my-reviews') {
      this.currentUser$.pipe(
        filter(user => !!user?.id),
        take(1)
      ).subscribe(user => {
        if (user?.id) {
          this.store.dispatch(OrdersActions.loadUserReviews({ userId: user.id }));
        }
      });
    } else if (tab === 'my-wishlist') {
      this.store.dispatch(WishlistActions.loadWishlist());
    }
  }

  updateUserInfo(): void {
    if (this.userInfoForm.valid) {
      const updatedUser = {
        ...this.userInfoForm.value
      };
      this.store.dispatch(AuthActions.updateUserProfile({ user: updatedUser }));
    } else {
      Object.keys(this.userInfoForm.controls).forEach(key => {
        this.userInfoForm.get(key)?.markAsTouched();
      });
    }
  }

  addNewAddress(): void {
    // TODO: Implement add address modal/form
  }

  addNewPaymentMethod(): void {
    // TODO: Implement add payment method modal/form
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/detalji-narudzbe', orderId]);
  }

  removeFromWishlist(productId: string): void {
    this.store.dispatch(WishlistActions.removeFromWishlist({ productId }));
  }

  getAvailabilityText(availability: string | undefined): string {
    if (!availability) return 'productDetails.unknown';
    switch (availability) {
      case 'available': return 'productDetails.inStock';
      case 'limited': return 'productDetails.limitedStock';
      case 'out-of-stock': return 'productDetails.outOfStock';
      default: return 'productDetails.unknown';
    }
  }

  viewProductDetails(productId: string | undefined): void {
    if (productId) {
      this.router.navigate(['/proizvodi', productId]);
    }
  }

  writeReviewForOrder(orderId: string): void {
    this.selectedOrderId = orderId;
    this.selectedProductId = '';
    this.showReviewModal = true;
  }

  onReviewSubmitted(reviewData: any): void {
    this.showReviewModal = false;
    this.orderReviewStatusCache.clear();
    // Reload user reviews after submitting a new review
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.store.dispatch(OrdersActions.loadUserReviews({ userId: user.id }));
      }
    });
  }

  onReviewCancelled(): void {
    this.showReviewModal = false;
  }

  getOrderReviewStatus(orderId: string): string {
    if (this.orderReviewStatusCache.has(orderId)) {
      return this.orderReviewStatusCache.get(orderId)!.status;
    }

    // Default to no-reviews if we don't have the data yet
    return 'no-reviews';
  }

  getMissingReviewCount(orderId: string): number {
    return this.orderReviewStatusCache.get(orderId)?.missingCount || 0;
  }

  private updateOrderReviewStatus(): void {
    // This method will be called when orders and reviews are loaded
    this.orders$.pipe(take(1)).subscribe(orders => {
      this.reviews$.pipe(take(1)).subscribe(reviews => {
        orders.forEach(order => {
          const orderReviews = reviews.filter((r: Review) => r.orderId === order.id);
          const orderItems = order.items || [];

          if (orderReviews.length === 0) {
            this.orderReviewStatusCache.set(order.id, { status: 'no-reviews', missingCount: orderItems.length });
          } else if (orderReviews.length === orderItems.length) {
            this.orderReviewStatusCache.set(order.id, { status: 'all-reviewed', missingCount: 0 });
          } else {
            this.orderReviewStatusCache.set(order.id, {
              status: 'partial-reviews',
              missingCount: orderItems.length - orderReviews.length
            });
          }
        });
      });
    });
  }

  async updatePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.passwordError = '';
    const newPassword = this.passwordForm.get('newPassword')?.value;

    try {
      const { error } = await this.supabaseService.client.auth.updateUser({
        password: newPassword
      });

      if (error) {
        this.passwordError = error.message;
      } else {
        this.showPasswordSuccessMessage = true;
        this.passwordForm.reset();
        setTimeout(() => {
          this.showPasswordSuccessMessage = false;
        }, 3000);
      }
    } catch (error: any) {
      this.passwordError = error.message || 'An error occurred';
    }
  }
} 