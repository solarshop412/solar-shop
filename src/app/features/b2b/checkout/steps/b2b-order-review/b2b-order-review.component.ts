import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { selectB2BCartItems } from '../../../cart/store/b2b-cart.selectors';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import { B2BCartItem } from '../../../cart/models/b2b-cart.model';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-b2b-order-review',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './b2b-order-review.component.html',
    styleUrls: ['./b2b-order-review.component.scss']
})
export class B2bOrderReviewComponent implements OnInit {
    private store = inject(Store);
    private router = inject(Router);

    cartItems$: Observable<B2BCartItem[]>;

    constructor() {
        this.cartItems$ = this.store.select(selectB2BCartItems);
    }

    ngOnInit() {
        // Cart is already loaded by the B2B layout
    }

    trackByItemId(index: number, item: B2BCartItem): string {
        return item.id;
    }

    increaseQuantity(itemId: string) {
        // Get the current item to determine new quantity
        this.cartItems$.pipe(take(1)).subscribe(items => {
            const item = items.find(i => i.id === itemId);
            if (item) {
                this.store.dispatch(B2BCartActions.updateB2BCartItem({
                    productId: item.productId,
                    quantity: item.quantity + 1
                }));
            }
        });
    }

    decreaseQuantity(itemId: string) {
        // Get the current item to determine new quantity
        this.cartItems$.pipe(take(1)).subscribe(items => {
            const item = items.find(i => i.id === itemId);
            if (item && item.quantity > 1) {
                this.store.dispatch(B2BCartActions.updateB2BCartItem({
                    productId: item.productId,
                    quantity: item.quantity - 1
                }));
            }
        });
    }

    removeItem(itemId: string) {
        // Get the current item to get productId
        this.cartItems$.pipe(take(1)).subscribe(items => {
            const item = items.find(i => i.id === itemId);
            if (item) {
                this.store.dispatch(B2BCartActions.removeFromB2BCart({ productId: item.productId }));
            }
        });
    }

    continueToShipping() {
        // Save current cart items to localStorage for order processing
        this.cartItems$.pipe(take(1)).subscribe(cartItems => {
            console.log('Saving B2B cart items for checkout:', cartItems);
            localStorage.setItem('b2bCheckoutItems', JSON.stringify(cartItems));
        });

        this.router.navigate(['/partneri/blagajna/dostava']);
    }

    getProductImageUrl(item: B2BCartItem): string {
        return item.imageUrl || '';
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img) {
            img.style.display = 'none';
        }
    }
} 