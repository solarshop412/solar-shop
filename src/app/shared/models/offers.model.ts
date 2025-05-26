export interface Offer {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    type: OfferType;
    status: OfferStatus;
    priority: number;
    featured: boolean;
    image: string;
    bannerImage?: string;
    thumbnailImage?: string;
    discount: OfferDiscount;
    conditions: OfferConditions;
    applicableProducts: OfferProductScope;
    targetAudience: OfferTargetAudience;
    schedule: OfferSchedule;
    usage: OfferUsage;
    promotion: OfferPromotion;
    seoMetadata?: SeoMetadata;
    analytics: OfferAnalytics;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: string;
}

export type OfferType =
    | 'percentage_discount'
    | 'fixed_amount_discount'
    | 'buy_x_get_y'
    | 'free_shipping'
    | 'bundle_deal'
    | 'flash_sale'
    | 'seasonal_sale'
    | 'clearance'
    | 'loyalty_reward'
    | 'referral_bonus'
    | 'first_time_customer'
    | 'bulk_discount';

export type OfferStatus =
    | 'draft'
    | 'scheduled'
    | 'active'
    | 'paused'
    | 'expired'
    | 'cancelled'
    | 'pending_approval';

export interface OfferDiscount {
    type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
    value: number;
    maxDiscountAmount?: number;
    currency?: string;
    buyQuantity?: number;
    getQuantity?: number;
    getFreeProduct?: boolean;
    getDiscountedProduct?: boolean;
    getDiscountPercentage?: number;
}

export interface OfferConditions {
    minOrderAmount?: number;
    maxOrderAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
    requiredProducts?: string[];
    excludedProducts?: string[];
    requiredCategories?: string[];
    excludedCategories?: string[];
    requiredBrands?: string[];
    excludedBrands?: string[];
    customerSegments?: string[];
    geographicRestrictions?: GeographicRestriction[];
    paymentMethods?: string[];
    shippingMethods?: string[];
    firstTimeCustomerOnly?: boolean;
    existingCustomerOnly?: boolean;
    loyaltyTierRequired?: string[];
}

export interface GeographicRestriction {
    type: 'include' | 'exclude';
    countries?: string[];
    states?: string[];
    cities?: string[];
    postalCodes?: string[];
}

export interface OfferProductScope {
    type: 'all_products' | 'specific_products' | 'categories' | 'brands' | 'tags';
    productIds?: string[];
    categoryIds?: string[];
    brandIds?: string[];
    tags?: string[];
    excludeProductIds?: string[];
    excludeCategoryIds?: string[];
    excludeBrandIds?: string[];
    excludeTags?: string[];
}

export interface OfferTargetAudience {
    type: 'all_customers' | 'specific_customers' | 'customer_segments' | 'new_customers' | 'returning_customers';
    customerIds?: string[];
    customerSegments?: string[];
    loyaltyTiers?: string[];
    registrationDateRange?: {
        start: string;
        end: string;
    };
    lastPurchaseDateRange?: {
        start: string;
        end: string;
    };
    totalSpentRange?: {
        min: number;
        max: number;
    };
    orderCountRange?: {
        min: number;
        max: number;
    };
}

export interface OfferSchedule {
    startDate: string;
    endDate?: string;
    timezone: string;
    recurringPattern?: RecurringPattern;
    blackoutDates?: string[];
    activeDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    activeHours?: {
        start: string;
        end: string;
    };
}

export interface RecurringPattern {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endAfter?: number;
    endDate?: string;
}

export interface OfferUsage {
    maxTotalUsage?: number;
    maxUsagePerCustomer?: number;
    maxUsagePerDay?: number;
    maxUsagePerWeek?: number;
    maxUsagePerMonth?: number;
    currentUsage: number;
    customerUsage: { [customerId: string]: number };
    dailyUsage: { [date: string]: number };
    weeklyUsage: { [week: string]: number };
    monthlyUsage: { [month: string]: number };
}

export interface OfferPromotion {
    couponCode?: string;
    autoApply: boolean;
    stackable: boolean;
    stackableWith?: string[];
    notStackableWith?: string[];
    displayOnStorefront: boolean;
    displayInCart: boolean;
    displayOnCheckout: boolean;
    emailCampaignId?: string;
    socialMediaCampaignId?: string;
    affiliateProgram?: boolean;
    referralProgram?: boolean;
}

export interface OfferAnalytics {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
    customersAcquired: number;
    returningCustomers: number;
    dailyStats: { [date: string]: DailyOfferStats };
    topProducts: ProductPerformance[];
    customerSegmentPerformance: SegmentPerformance[];
}

export interface DailyOfferStats {
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    uniqueCustomers: number;
}

export interface ProductPerformance {
    productId: string;
    productName: string;
    sales: number;
    revenue: number;
    conversionRate: number;
}

export interface SegmentPerformance {
    segment: string;
    customers: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
}

export interface SeoMetadata {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
}

export interface OfferTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    type: OfferType;
    defaultSettings: Partial<Offer>;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface OfferRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: string;
    priority: number;
    isActive: boolean;
    offerId: string;
}

export interface OfferNotification {
    id: string;
    offerId: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    template: string;
    recipients: NotificationRecipient[];
    scheduledAt?: string;
    sentAt?: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    metrics: NotificationMetrics;
}

export interface NotificationRecipient {
    customerId: string;
    email?: string;
    phone?: string;
    pushToken?: string;
    preferences: NotificationPreferences;
}

export interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface NotificationMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
}

export interface OfferFilter {
    types?: OfferType[];
    status?: OfferStatus[];
    featured?: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    discountRange?: {
        min: number;
        max: number;
    };
    categories?: string[];
    brands?: string[];
    customerSegments?: string[];
    search?: string;
    sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'priority' | 'conversions' | 'revenue';
    sortOrder?: 'asc' | 'desc';
}

export interface OfferSearchResult {
    offers: Offer[];
    total: number;
    page: number;
    limit: number;
    filters: OfferFilter;
    facets: OfferFacets;
}

export interface OfferFacets {
    types: FacetItem[];
    status: FacetItem[];
    categories: FacetItem[];
    brands: FacetItem[];
    customerSegments: FacetItem[];
    discountRanges: FacetItem[];
}

export interface FacetItem {
    value: string;
    label: string;
    count: number;
    selected: boolean;
}

export interface OfferStats {
    totalOffers: number;
    activeOffers: number;
    scheduledOffers: number;
    expiredOffers: number;
    totalRevenue: number;
    totalConversions: number;
    averageConversionRate: number;
    topPerformingOffers: Offer[];
    recentOffers: Offer[];
    offersByType: { [type: string]: number };
    offersByStatus: { [status: string]: number };
    monthlyPerformance: MonthlyOfferPerformance[];
}

export interface MonthlyOfferPerformance {
    month: string;
    offersCreated: number;
    totalRevenue: number;
    totalConversions: number;
    averageConversionRate: number;
} 