export interface Coupon {
    id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    maxOrderAmount?: number;
    applicableProductIds?: string[];
    excludedProductIds?: string[];
    maxUsage?: number;
    currentUsage: number;
    maxUsagePerCustomer?: number;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    autoApply: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CouponValidationResult {
    isValid: boolean;
    errorMessage?: string;
    discountAmount?: number;
}

export interface AppliedCoupon {
    coupon: Coupon;
    discountAmount: number;
    appliedAt: Date;
} 