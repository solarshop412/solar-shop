export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}