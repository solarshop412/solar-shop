import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as CartSelectors from '../cart/store/cart.selectors';
import * as CartActions from '../cart/store/cart.actions';
import {
  AppliedCoupon,
  CartItem,
  CartSummary,
} from '../../../shared/models/cart.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  cartItems$: Observable<CartItem[]>;
  cartSummary$: Observable<CartSummary>;
  appliedCoupons$: Observable<AppliedCoupon[]>;
  couponError$: Observable<string | null>;
  isCouponLoading$: Observable<boolean>;
  couponCode = '';
  currentStep = 1;

  constructor() {
    this.cartItems$ = this.store.select(CartSelectors.selectCartItems);
    this.cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
    this.appliedCoupons$ = this.store.select(
      CartSelectors.selectAppliedCoupons,
    );
    this.couponError$ = this.store.select(CartSelectors.selectCouponError);
    this.isCouponLoading$ = this.store.select(
      CartSelectors.selectIsCouponLoading,
    );
  }

  ngOnInit() {
    this.store.dispatch(CartActions.resetCouponError());
    // Cart is already loaded by the cart sidebar in the page layout
    // No need to dispatch loadCart here as it would be redundant

    // Check if cart is empty and redirect if needed
    this.store.select(CartSelectors.selectIsCartEmpty).subscribe((isEmpty) => {
      if (isEmpty) {
        this.router.navigate(['/proizvodi']);
      }
    });

    // Update current step based on route
    this.updateCurrentStep();

    // Listen to route changes to update step
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentStep();
      });
  }

  get isApplyButtonDisabled(): boolean {
    return !this.couponCode.trim();
  }

  applyCoupon() {
    const trimmedCode = this.couponCode.trim();
    if (!trimmedCode) {
      return;
    }

    this.store.dispatch(CartActions.applyCoupon({ code: trimmedCode }));
    this.couponCode = '';
  }

  removeCoupon(couponId: string) {
    this.store.dispatch(CartActions.removeCoupon({ couponId }));
  }

  private updateCurrentStep() {
    const url = this.router.url;
    if (url.includes('/blagajna/pregled-narudzbe')) {
      this.currentStep = 1;
    } else if (url.includes('/blagajna/dostava')) {
      this.currentStep = 2;
    } else if (url.includes('/blagajna/placanje')) {
      this.currentStep = 3;
    }
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }
}
