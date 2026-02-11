export interface PartnerProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  sku: string;
  stock_quantity?: number;
  discount_percentage?: number;
  discount_amount?: number;
  has_partner_pricing?: boolean;
  partner_price?: number;
  partner_discounted_price?: number;
  partner_savings?: number;
}