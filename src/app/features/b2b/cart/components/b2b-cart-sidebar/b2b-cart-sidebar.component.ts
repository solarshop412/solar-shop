import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { B2BCartItem, B2BCartSummary, B2BAppliedCoupon } from '../../models/b2b-cart.model';
import * as B2BCartSelectors from '../../store/b2b-cart.selectors';
import * as B2BCartActions from '../../store/b2b-cart.actions';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-b2b-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    TranslatePipe, 
    LucideAngularModule
  ],
  templateUrl: './b2b-cart-sidebar.component.html',
  styleUrls: ['./b2b-cart-sidebar.component.scss']
})
export class B2BCartSidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private imageErrors = new Set<string>();

  // Observables
  cartItems$: Observable<B2BCartItem[]>;
  cartSummary$: Observable<B2BCartSummary>;
  loading$: Observable<boolean>;
  isEmpty$: Observable<boolean>;
  companyInfo$: Observable<{ companyId: string | null; companyName: string | null }>;
  sidebarOpen$: Observable<boolean>;
  hasMinimumOrderViolations$: Observable<boolean>;
  appliedCoupons$: Observable<B2BAppliedCoupon[]>;
  couponError$: Observable<string | null>;
  isCouponLoading$: Observable<boolean>;
  hasCouponsApplied$: Observable<boolean>;

  couponCode = '';

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  get isApplyButtonDisabled(): boolean {
    return !this.couponCode.trim();
  }

  constructor(private store: Store, private router: Router, private translationService: TranslationService) {
    this.cartItems$ = this.store.select(B2BCartSelectors.selectB2BCartItems);
    this.cartSummary$ = this.store.select(B2BCartSelectors.selectB2BCartSummary);
    this.loading$ = this.store.select(B2BCartSelectors.selectB2BCartLoading);
    this.isEmpty$ = this.store.select(B2BCartSelectors.selectB2BCartIsEmpty);
    this.companyInfo$ = this.store.select(B2BCartSelectors.selectB2BCartCompanyInfo);
    this.sidebarOpen$ = this.store.select(B2BCartSelectors.selectB2BCartSidebarOpen);
    this.appliedCoupons$ = this.store.select(B2BCartSelectors.selectB2BCartAppliedCoupons);
    this.couponError$ = this.store.select(B2BCartSelectors.selectB2BCartCouponError);
    this.isCouponLoading$ = this.store.select(B2BCartSelectors.selectB2BCartIsCouponLoading);
    this.hasCouponsApplied$ = this.store.select(B2BCartSelectors.selectB2BCartHasCoupons);
    this.hasMinimumOrderViolations$ = this.cartItems$.pipe(
      takeUntil(this.destroy$),
      // Check if any item has quantity below minimum order
      map((items: B2BCartItem[]) => items.some(item => item.quantity < item.minimumOrder))
    );
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(_event: KeyboardEvent) {
    this.closeSidebar();
  }

  closeSidebar(): void {
    this.store.dispatch(B2BCartActions.closeB2BCartSidebar());
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) {
      return;
    }

    this.companyInfo$.pipe(take(1)).subscribe(info => {
      if (!info.companyId) {
        this.store.dispatch(
          B2BCartActions.applyB2BCouponFailure({
            error: this.translationService.translate('b2b.auth.companyIdNotFound')
          })
        );
        return;
      }

      this.store.dispatch(B2BCartActions.applyB2BCoupon({ code, companyId: info.companyId }));
      this.couponCode = '';
    });
  }

  removeCoupon(couponId: string): void {
    this.store.dispatch(B2BCartActions.removeB2BCoupon({ couponId }));
  }

  onOverlayClick(event: MouseEvent) {
    // Close cart if clicking on the overlay (not the sidebar content)
    const target = event.target as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;

    // Check if the click target is the overlay itself or the background div
    if (target === currentTarget || target.classList.contains('cart-overlay') || target.classList.contains('bg-black')) {
      this.closeSidebar();
    }
  }

  increaseQuantity(productId: string): void {
    // Get current quantity and increase by 1
    this.cartItems$.pipe(
      takeUntil(this.destroy$),
      // Take only the first emission to avoid multiple subscriptions
      take(1)
    ).subscribe((items: B2BCartItem[]) => {
      const item = items.find((i: B2BCartItem) => i.productId === productId);
      if (item) {
        this.store.dispatch(B2BCartActions.updateB2BCartItem({
          productId,
          quantity: item.quantity + 1
        }));
      }
    });
  }

  decreaseQuantity(productId: string): void {
    // Get current quantity and decrease by 1 (minimum is the minimum order requirement)
    this.cartItems$.pipe(
      takeUntil(this.destroy$),
      // Take only the first emission to avoid multiple subscriptions
      take(1)
    ).subscribe((items: B2BCartItem[]) => {
      const item = items.find((i: B2BCartItem) => i.productId === productId);
      if (item && item.quantity > item.minimumOrder) {
        this.store.dispatch(B2BCartActions.updateB2BCartItem({
          productId,
          quantity: item.quantity - 1
        }));
      }
    });
  }

  removeItem(productId: string): void {
    this.store.dispatch(B2BCartActions.removeFromB2BCart({ productId }));
  }

  clearCart(): void {
    const confirmMessage = this.translationService.translate('b2bCart.clearCartConfirm');
    if (confirm(confirmMessage)) {
      this.store.dispatch(B2BCartActions.clearB2BCart());
    }
  }

  proceedToCheckout(): void {
    this.closeSidebar();
    this.router.navigate(['/partneri/blagajna']);
  }

  trackByProductId(_index: number, item: B2BCartItem): string {
    return item.productId;
  }

  // Minimum order validation methods
  isMinimumOrderMet(item: B2BCartItem): boolean {
    return item.quantity >= item.minimumOrder;
  }

  canDecreaseQuantity(item: B2BCartItem): boolean {
    return item.quantity > item.minimumOrder;
  }

  getMinimumOrderMessage(item: B2BCartItem): string {
    if (this.isMinimumOrderMet(item)) {
      return '';
    }
    return this.translationService.translate('b2bCart.minimumOrderRequired', {
      minimum: item.minimumOrder,
      current: item.quantity
    });
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

  onImageError(event: any, _productId: string) {
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

  getNextTierHint(item: B2BCartItem): string {
    if (!item.priceTier1) {
      return '';
    }

    // Check if there's a next tier available
    if (item.appliedTier === 1 && item.quantityTier2 && item.priceTier2) {
      const neededQty = item.quantityTier2 - item.quantity;
      if (neededQty > 0 && neededQty <= 5) {
        const savings = ((item.unitPrice - item.priceTier2) * item.quantityTier2).toFixed(2);
        return this.translationService.translate('b2bCart.addMoreForTier', {
          qty: neededQty,
          price: item.priceTier2.toFixed(2),
          savings: savings
        });
      }
    } else if (item.appliedTier === 2 && item.quantityTier3 && item.priceTier3) {
      const neededQty = item.quantityTier3 - item.quantity;
      if (neededQty > 0 && neededQty <= 10) {
        const savings = ((item.unitPrice - item.priceTier3) * item.quantityTier3).toFixed(2);
        return this.translationService.translate('b2bCart.addMoreForTier', {
          qty: neededQty,
          price: item.priceTier3.toFixed(2),
          savings: savings
        });
      }
    }

    return '';
  }
} 