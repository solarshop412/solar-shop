export interface HighlightOffer {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  type: string;
  status: string;
  featured: boolean;
  isB2B: boolean;
  endDate?: string;
}