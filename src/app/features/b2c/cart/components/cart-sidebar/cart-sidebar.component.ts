import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../../../../../shared/models/cart.model';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    TranslatePipe, 
    LucideAngularModule
  ],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  // Observables
  isCartOpen$ = this.store.select(CartSelectors.selectIsCartOpen);
  isCartEmpty$ = this.store.select(CartSelectors.selectIsCartEmpty);
  cartItems$ = this.store.select(CartSelectors.selectCartItems);
  cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
  appliedCoupons$ = this.store.select(CartSelectors.selectAppliedCoupons);
  couponError$ = this.store.select(CartSelectors.selectCouponError);
  isCouponLoading$ = this.store.select(CartSelectors.selectIsCouponLoading);
  canApplyCoupon$ = this.store.select(CartSelectors.selectCanApplyCoupon);
  hasCouponsApplied$ = this.store.select(CartSelectors.selectHasCouponsApplied);

  // Show applied coupons if there are any coupons applied
  // For individual product discounts, the discount is shown on each item, not in summary
  shouldShowAppliedCoupons$ = combineLatest([
    this.appliedCoupons$,
    this.cartItems$
  ]).pipe(
    map(([coupons, items]) => {
      if (!coupons || coupons.length === 0) return false;

      // Show coupon if any item has offerSavings (individual discount applied)
      const hasIndividualDiscounts = items && items.some(item => item.offerSavings && item.offerSavings > 0);

      return hasIndividualDiscounts;
    })
  );

  // Calculate total individual discount amount for display in coupon section
  totalIndividualDiscount$ = this.cartItems$.pipe(
    map(items => {
      if (!items) return 0;
      return items.reduce((total, item) => {
        return total + ((item.offerSavings || 0) * item.quantity);
      }, 0);
    })
  );

  // Calculate enhanced summary with pre-discount subtotal
  enhancedCartSummary$ = combineLatest([
    this.cartSummary$,
    this.cartItems$,
    this.totalIndividualDiscount$
  ]).pipe(
    map(([summary, items, individualDiscount]) => {
      if (!summary || !items) return null;

      // Calculate subtotal before any discounts
      const subtotalBeforeDiscount = items.reduce((total, item) => {
        // Use offerOriginalPrice if available (price before coupon), otherwise use current price
        const priceBeforeDiscount = item.offerOriginalPrice || item.price;
        return total + (priceBeforeDiscount * item.quantity);
      }, 0);

      return {
        ...summary,
        subtotalBeforeDiscount,
        totalDiscount: individualDiscount, // Use individual discount for display
        finalTotal: summary.total
      };
    })
  );

  // Component state
  couponCode = '';
  private imageErrors = new Set<string>();

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  // Helper properties for template
  get isApplyButtonDisabled(): boolean {
    // Simple synchronous check for better performance
    return !this.couponCode.trim();
  }

  constructor() {
    // Debug: Log cart state changes
    this.isCartOpen$.subscribe(isOpen => {
    });

    this.cartItems$.subscribe(items => {
    });

    // Debug: Log cart loading state
    this.store.select(CartSelectors.selectIsCartLoading).subscribe(isLoading => {
    });

    // Debug: Log cart errors
    this.store.select(CartSelectors.selectCartError).subscribe(error => {
      if (error) {
      }
    });

    // Debug: Log the entire cart state
    this.store.select(CartSelectors.selectCartState).subscribe(cartState => {
    });
  }

  ngOnInit() {
    // Primary cart loading - this component should be included only once in the page layout
    // to avoid duplicate loadCart dispatches. Other components should not dispatch loadCart
    // as the cart sidebar handles this responsibility.
    this.store.dispatch(CartActions.loadCart());

    // Reset coupon errors when cart opens
    this.isCartOpen$.subscribe(isOpen => {
      if (isOpen) {
        this.store.dispatch(CartActions.resetCouponError());
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeCart();
  }

  closeCart() {
    this.store.dispatch(CartActions.closeCart());
  }

  onOverlayClick(event: MouseEvent) {
    // Close cart if clicking on the overlay (not the sidebar content)
    const target = event.target as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;

    // Check if the click target is the overlay itself or the background div
    if (target === currentTarget || target.classList.contains('cart-overlay') || target.classList.contains('bg-black')) {
      console.log('Overlay clicked - closing cart');
      this.closeCart();
    }
  }

  increaseQuantity(itemId: string) {
    this.store.dispatch(CartActions.increaseQuantity({ itemId }));
  }

  decreaseQuantity(itemId: string) {
    this.store.dispatch(CartActions.decreaseQuantity({ itemId }));
  }

  removeItem(itemId: string) {
    this.store.dispatch(CartActions.removeFromCart({ itemId }));
  }

  applyCoupon() {
    if (this.couponCode.trim()) {
      this.store.dispatch(CartActions.applyCoupon({ code: this.couponCode.trim() }));
      // Clear the input after applying
      this.couponCode = '';
    }
  }

  removeCoupon(couponId: string) {
    this.store.dispatch(CartActions.removeCoupon({ couponId }));
  }

  proceedToCheckout() {
    // Reset cart step to first step and close the cart sidebar
    this.store.dispatch(CartActions.setCartStep({ step: 'cart' }));
    this.store.dispatch(CartActions.closeCart());
    // Navigate to the first step of checkout
    this.router.navigate(['/blagajna/pregled-narudzbe']);
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  getImageSrc(imagePath: string): string {
    // Ensure we have a valid image path and handle potential errors
    if (!imagePath) {
      return 'assets/images/product-placeholder.svg';
    }

    // If this image has already failed to load, return the fallback immediately
    if (this.imageErrors.has(imagePath)) {
      return 'assets/images/product-placeholder.svg';
    }

    return imagePath;
  }

  onImageError(event: any, itemId: string) {
    // Prevent infinite error loops by tracking failed images
    const originalSrc = event.target.src;

    // Add to error set to prevent retrying
    this.imageErrors.add(originalSrc);

    // Set fallback image only if it's not already the fallback
    if (!originalSrc.includes('product-placeholder.svg')) {
      event.target.src = 'assets/images/product-placeholder.svg';
    }

    // Suppress console errors by preventing default behavior
    event.preventDefault();
  }

  getFreeShippingProgress(): number {
    // Calculate progress towards free shipping
    // This would need to be calculated properly with the actual values from the store
    return 75; // Placeholder - in real implementation, calculate based on cart summary
  }
} 
