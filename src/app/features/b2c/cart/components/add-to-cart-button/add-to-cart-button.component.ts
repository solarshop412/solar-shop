import { Component, Input, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-add-to-cart-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LucideAngularModule],
  templateUrl: './add-to-cart-button.component.html',
  styleUrls: ['./add-to-cart-button.component.scss'],
})
export class AddToCartButtonComponent {
  readonly ShoppingCartIcon = ShoppingCart;
  private store = inject(Store);

  @ViewChild('addButton', { static: true })
  addButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('flyingCart', { static: true })
  flyingCart!: ElementRef<HTMLDivElement>;

  @Input() productId!: string;
  @Input() variantId?: string;
  @Input() quantity = 1;
  @Input() buttonText = 'Add to Cart';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() fullWidth = false;
  @Input() availability: 'available' | 'limited' | 'out-of-stock' = 'available';

  // Offer-related inputs for discounted pricing
  @Input() offerId?: string;
  @Input() offerName?: string;
  @Input() offerType?: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle';
  @Input() offerDiscount?: number;
  @Input() offerOriginalPrice?: number;
  @Input() offerValidUntil?: string;
  @Input() individualDiscount?: number;
  @Input() individualDiscountType?: 'percentage' | 'fixed_amount';

  isLoading$ = this.store.select(CartSelectors.selectIsCartLoading);
  isAnimating = false;

  get isOutOfStock(): boolean {
    return this.availability === 'out-of-stock';
  }

  get buttonClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Variant classes - handle out-of-stock state
    const variantClasses = {
      primary: this.isOutOfStock
        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
        : 'bg-solar-500 text-white hover:bg-solar-500 focus:ring-2 focus:ring-solar-500 focus:ring-offset-2',
      secondary: this.isOutOfStock
        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
        : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      outline: this.isOutOfStock
        ? 'border-2 border-gray-400 text-gray-600 cursor-not-allowed'
        : 'border-2 border-solar-500 text-solar-500 hover:bg-solar-500 hover:text-white focus:ring-2 focus:ring-solar-500 focus:ring-offset-2',
    };

    // Width classes
    const widthClasses = this.fullWidth ? 'w-full' : '';

    return [
      baseClasses,
      sizeClasses[this.size],
      variantClasses[this.variant],
      widthClasses,
    ]
      .filter(Boolean)
      .join(' ');
  }

  addToCart() {
    if (this.productId && !this.isOutOfStock) {
      // Check if we have offer information to apply discounts
      if (
        this.offerId &&
        this.offerName &&
        this.offerType &&
        this.offerDiscount !== undefined &&
        this.offerOriginalPrice !== undefined
      ) {
        // Use offer-based add to cart with individual discounts
        this.store.dispatch(
          CartActions.addToCartFromOffer({
            productId: this.productId,
            quantity: this.quantity,
            variantId: this.variantId,
            offerId: this.offerId,
            offerName: this.offerName,
            offerType: this.offerType,
            offerDiscount:
              this.individualDiscount !== undefined
                ? this.individualDiscount
                : this.offerDiscount,
            offerOriginalPrice: this.offerOriginalPrice,
            offerValidUntil: this.offerValidUntil,
            individualDiscount: this.individualDiscount,
            individualDiscountType: this.individualDiscountType,
          }),
        );
      } else {
        // Regular add to cart without offer discount
        this.store.dispatch(
          CartActions.addToCart({
            productId: this.productId,
            quantity: this.quantity,
            variantId: this.variantId,
          }),
        );
      }

      // Add success animation to button
      this.addButtonSuccessAnimation();
    }
  }

  private addButtonSuccessAnimation() {
    const button = this.addButton.nativeElement;
    button.classList.add('button-success');

    setTimeout(() => {
      button.classList.remove('button-success');
    }, 600);
  }
}
