import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cart-button.component.html',
  styleUrls: ['./cart-button.component.scss'],
})
export class CartButtonComponent {
  private store = inject(Store);

  cartItemCount$ = this.store.select(CartSelectors.selectCartItemCount);

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  openCart() {
    this.store.dispatch(CartActions.openCart());
  }
}
