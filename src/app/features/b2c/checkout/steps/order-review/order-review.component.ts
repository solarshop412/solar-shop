import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as CartSelectors from '../../../cart/store/cart.selectors';
import * as CartActions from '../../../cart/store/cart.actions';
import { CartItem, AppliedCoupon } from '../../../../../shared/models/cart.model';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './order-review.component.html',
  styleUrls: ['./order-review.component.scss']
})
export class OrderReviewComponent {
  private store = inject(Store);
  private router = inject(Router);

  cartItems$: Observable<CartItem[]>;
  appliedCoupons$: Observable<AppliedCoupon[]>;
  cartSummary$: Observable<{
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    itemCount: number;
  }>;

  constructor() {
    this.cartItems$ = this.store.select(CartSelectors.selectCartItems);
    this.appliedCoupons$ = this.store.select(CartSelectors.selectAppliedCoupons);
    this.cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
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

  continueToShipping() {
    // Save current cart items to localStorage for order processing
    this.cartItems$.pipe(take(1)).subscribe(cartItems => {
      console.log('Saving cart items for checkout:', cartItems);
      localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    });

    this.router.navigate(['/blagajna/dostava']);
  }
} 