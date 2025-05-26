import { Cart, CartItem, AppliedCoupon } from '../../../../shared/models/cart.model';
import { Coupon } from '../../../../shared/models/coupon.model';

export interface CartState {
    // Cart data
    cart: Cart | null;

    // UI state
    isCartOpen: boolean;
    isLoading: boolean;

    // Coupon state
    availableCoupons: Coupon[];
    couponCode: string;
    isCouponLoading: boolean;
    couponError: string | null;

    // Errors
    error: string | null;

    // Cart step for checkout process
    currentStep: CartStep;
}

export type CartStep = 'cart' | 'shipping' | 'payment' | 'review';

export const initialCartState: CartState = {
    cart: null,
    isCartOpen: false,
    isLoading: false,
    availableCoupons: [],
    couponCode: '',
    isCouponLoading: false,
    couponError: null,
    error: null,
    currentStep: 'cart'
}; 