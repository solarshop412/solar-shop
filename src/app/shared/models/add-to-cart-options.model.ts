export interface AddToCartOptions {
    partnerOfferId?: string;
    partnerOfferName?: string;
    partnerOfferType?: 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle' | 'buy_x_get_y';
    partnerOfferDiscount?: number;
    partnerOfferValidUntil?: string;
    individualDiscount?: number;
    individualDiscountType?: 'percentage' | 'fixed_amount';
    originalPrice?: number;
    isBundle?: boolean;
    bundleProductIds?: string[];
}