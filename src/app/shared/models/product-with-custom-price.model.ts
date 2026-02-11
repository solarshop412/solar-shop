import { Product } from "../../features/admin/company-pricing/store/company-pricing.actions";

export interface ProductWithCustomPrice extends Product {
  customPrice: number;
  hasCustomPrice: boolean;
  minimumOrder: number;
  // Quantity-based pricing tiers
  quantityTier1: number;
  priceTier1: number;
  quantityTier2?: number;
  priceTier2?: number;
  quantityTier3?: number;
  priceTier3?: number;
}