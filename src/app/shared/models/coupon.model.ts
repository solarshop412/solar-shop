export interface Coupon {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: CouponType;
    value: number;
    currency?: string;
    minimumOrderAmount?: number;
    maximumOrderAmount?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number;
    usageCount: number;
    userUsageLimit?: number;
    isActive: boolean;
    isPublic: boolean;
    validFrom: string;
    validUntil?: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    excludedCategories?: string[];
    restrictions?: CouponRestrictions;
    metadata?: CouponMetadata;
    createdAt: string;
    updatedAt: string;
}

export type CouponType =
    | 'percentage'
    | 'fixed_amount'
    | 'free_shipping'
    | 'buy_x_get_y'
    | 'buy_x_get_percentage_off'
    | 'buy_x_get_fixed_off';

export interface CouponRestrictions {
    minOrderAmount?: number;
    maxOrderAmount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    excludedCategories?: string[];
    maxUsagePerUser?: number;
    firstTimeCustomerOnly?: boolean;
    newCustomersOnly?: boolean;
    existingCustomersOnly?: boolean;
    minimumQuantity?: number;
    maximumQuantity?: number;
    allowCombination?: boolean;
    combinableWith?: string[];
    notCombinableWith?: string[];
    dayOfWeekRestrictions?: number[]; // 0-6 (Sunday-Saturday)
    timeRestrictions?: {
        startTime: string; // HH:mm format
        endTime: string;   // HH:mm format
    };
    geographicRestrictions?: {
        allowedCountries?: string[];
        excludedCountries?: string[];
        allowedStates?: string[];
        excludedStates?: string[];
        allowedCities?: string[];
        excludedCities?: string[];
    };
}

export interface CouponMetadata {
    source?: string;
    campaign?: string;
    channel?: string;
    affiliateId?: string;
    referralCode?: string;
    tags?: string[];
    notes?: string;
    internalNotes?: string;
}

export interface CouponValidationResult {
    isValid: boolean;
    errors: CouponValidationError[];
    warnings: CouponValidationWarning[];
    discountAmount?: number;
    finalTotal?: number;
}

export interface CouponValidationError {
    type: CouponErrorType;
    message: string;
    details?: any;
}

export interface CouponValidationWarning {
    type: CouponWarningType;
    message: string;
    details?: any;
}

export type CouponErrorType =
    | 'invalid_code'
    | 'expired'
    | 'not_started'
    | 'usage_limit_exceeded'
    | 'user_usage_limit_exceeded'
    | 'minimum_order_not_met'
    | 'maximum_order_exceeded'
    | 'product_not_applicable'
    | 'category_not_applicable'
    | 'product_excluded'
    | 'category_excluded'
    | 'geographic_restriction'
    | 'time_restriction'
    | 'customer_restriction'
    | 'combination_not_allowed'
    | 'inactive_coupon';

export type CouponWarningType =
    | 'expiring_soon'
    | 'limited_usage_remaining'
    | 'better_coupon_available'
    | 'partial_application';

export interface CouponUsage {
    id: string;
    couponId: string;
    userId?: string;
    sessionId?: string;
    orderId?: string;
    cartId?: string;
    discountAmount: number;
    originalOrderAmount: number;
    finalOrderAmount: number;
    usedAt: string;
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        referrer?: string;
    };
}

export interface CouponStats {
    totalUsage: number;
    totalDiscountGiven: number;
    averageDiscountAmount: number;
    uniqueUsers: number;
    conversionRate: number;
    revenueImpact: number;
    usageByPeriod: {
        period: string;
        usage: number;
        discount: number;
    }[];
    topUsers: {
        userId: string;
        usageCount: number;
        totalDiscount: number;
    }[];
}

export interface CouponFilter {
    isActive?: boolean;
    type?: CouponType[];
    validFrom?: string;
    validUntil?: string;
    minimumValue?: number;
    maximumValue?: number;
    hasUsageLimit?: boolean;
    searchTerm?: string;
    sortBy?: 'createdAt' | 'validFrom' | 'validUntil' | 'usageCount' | 'value';
    sortOrder?: 'asc' | 'desc';
}

export interface CouponSearchResult {
    coupons: Coupon[];
    total: number;
    page: number;
    limit: number;
    filters: CouponFilter;
}

// Utility interfaces for coupon application
export interface CouponApplication {
    coupon: Coupon;
    discountAmount: number;
    applicableItems: string[]; // Cart item IDs
    validationResult: CouponValidationResult;
}

export interface CouponSuggestion {
    coupon: Coupon;
    potentialSavings: number;
    requirementsMet: boolean;
    missingRequirements?: string[];
    priority: number;
} 