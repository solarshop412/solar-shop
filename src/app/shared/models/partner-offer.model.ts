export interface PartnerOffer {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  imageUrl: string;
  description: string;
  shortDescription: string;
  type: string;
  status: string;
  couponCode?: string;
  startDate: string;
  endDate: string;
  featured: boolean;
  isB2B: boolean;
  applicable_category_ids?: string[];
  bundle?: boolean;
}
