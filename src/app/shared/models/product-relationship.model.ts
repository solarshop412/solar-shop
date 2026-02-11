export interface ProductRelationship {
  id?: string;
  product_id: string;
  related_product_id?: string;
  related_category_id?: string;
  relationship_type: string;
  sort_order: number;
  is_active: boolean;
}