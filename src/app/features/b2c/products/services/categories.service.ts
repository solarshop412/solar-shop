import { inject, Injectable } from '@angular/core';
import { Observable, from, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;

  // Optional / future-proof for nested categories
  parentId?: string | null;
  subcategories?: ProductCategory[];

  // UI helpers
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  ownProductCount?: number;

  // Optional timestamps (not present in your table right now)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryFilters {
  parentId?: string; // ignored unless your DB has parent_id
  isActive?: boolean; // ignored unless your DB has is_active
  limit?: number;
  offset?: number; // optional future use
}

type SupabaseCategoryRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;

  // these might not exist in DB; kept optional
  parent_id?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private supabaseService = inject(SupabaseService);

  getCategories(filters?: CategoryFilters): Observable<ProductCategory[]> {
    return from(this.fetchCategoriesFromSupabase(filters)).pipe(
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return of([]);
      }),
    );
  }

  /**
   * Your DB currently doesn't have is_active, so "active" == all.
   * Kept for API compatibility.
   */
  getActiveCategories(): Observable<ProductCategory[]> {
    return this.getCategories({ isActive: true });
  }

  getCategoryById(id: string): Observable<ProductCategory | null> {
    return from(this.fetchCategoryById(id)).pipe(
      catchError((error) => {
        console.error('Error fetching category:', error);
        return of(null);
      }),
    );
  }

  getCategoryBySlug(slug: string): Observable<ProductCategory | null> {
    return from(this.fetchCategoryBySlug(slug)).pipe(
      catchError((error) => {
        console.error('Error fetching category by slug:', error);
        return of(null);
      }),
    );
  }

  /**
   * With flat categories, top-level == all categories.
   * Kept for API compatibility.
   */
  getTopLevelCategories(): Observable<ProductCategory[]> {
    return this.getCategories();
  }

  /**
   * With flat categories, nested == flat list (no subcategories).
   * Kept for API compatibility.
   */
  getNestedCategories(): Observable<ProductCategory[]> {
    return this.getCategories();
  }

  /**
   * With flat categories, no subcategories exist.
   * Kept for API compatibility.
   */
  getSubCategories(_parentId: string): Observable<ProductCategory[]> {
    return of([]);
  }

  private async fetchCategoriesFromSupabase(
    filters?: CategoryFilters,
  ): Promise<ProductCategory[]> {
    try {
      const rows = (await this.supabaseService.getCategories({
        // Only applies if your service supports these (Fix B)
        isActive: filters?.isActive, // ignored if DB has no is_active
        limit: filters?.limit,
        offset: filters?.offset,
      })) as SupabaseCategoryRow[];

      // If you DON'T have parent_id in DB, this does nothing
      let filtered = rows;
      if (filters?.parentId !== undefined) {
        filtered = rows.filter((c: any) => c.parent_id === filters.parentId);
      }

      return await this.convertSupabaseCategoriesToLocal(filtered);
    } catch (error) {
      console.error('Error in fetchCategoriesFromSupabase:', error);
      return [];
    }
  }

  private async fetchCategoryById(id: string): Promise<ProductCategory | null> {
    try {
      const row = (await this.supabaseService.getTableById(
        'categories',
        id,
      )) as SupabaseCategoryRow | null;

      if (!row) return null;

      const counts = await this.getProductCountsForCategories([row.id]);
      return await this.convertSupabaseCategoryToLocal(row, counts[row.id] ?? 0);
    } catch (error) {
      console.error('Error in fetchCategoryById:', error);
      return null;
    }
  }

  private async fetchCategoryBySlug(
    slug: string,
  ): Promise<ProductCategory | null> {
    try {
      const rows = (await this.supabaseService.getCategories()) as SupabaseCategoryRow[];
      const row = rows.find((c) => (c.slug ?? '') === slug);
      if (!row) return null;

      const counts = await this.getProductCountsForCategories([row.id]);
      return await this.convertSupabaseCategoryToLocal(row, counts[row.id] ?? 0);
    } catch (error) {
      console.error('Error in fetchCategoryBySlug:', error);
      return null;
    }
  }

  private async convertSupabaseCategoriesToLocal(
    categories: SupabaseCategoryRow[],
  ): Promise<ProductCategory[]> {
    const ids = (categories ?? []).map((c) => c.id);
    const productCountsByCategory = await this.getProductCountsForCategories(ids);

    const out: ProductCategory[] = [];
    for (const category of categories ?? []) {
      const converted = await this.convertSupabaseCategoryToLocal(
        category,
        productCountsByCategory[category.id] ?? 0,
      );
      if (converted) out.push(converted);
    }
    return out;
  }

  private async convertSupabaseCategoryToLocal(
    category: SupabaseCategoryRow,
    productCount = 0,
  ): Promise<ProductCategory | null> {
    try {
      const slug = category.slug ?? this.createSlug(category.name);

      return {
        id: category.id,
        name: category.name,
        slug,
        description: category.description ?? null,
        imageUrl: category.image_url || this.getDefaultCategoryImage(slug),

        // these are optional depending on DB schema
        parentId: category.parent_id ?? null,
        isActive: category.is_active ?? true,
        sortOrder: category.sort_order ?? 0,

        productCount,
        ownProductCount: productCount,

        createdAt: category.created_at ? new Date(category.created_at) : undefined,
        updatedAt: category.updated_at ? new Date(category.updated_at) : undefined,
      };
    } catch (error) {
      console.error('Error converting category:', category?.name, error);
      return null;
    }
  }

  private async getProductCountsForCategories(
    categoryIds: string[],
  ): Promise<Record<string, number>> {
    const productCounts: Record<string, number> = {};
    (categoryIds ?? []).forEach((id) => (productCounts[id] = 0));

    if (!categoryIds?.length) return productCounts;

    try {
      // Preferred: RPC if you have it
      const { data, error } = await this.supabaseService.client.rpc(
        'get_distinct_product_counts_by_categories',
        { category_ids: categoryIds },
      );

      if (error) {
        console.warn(
          'RPC get_distinct_product_counts_by_categories failed, fallback:',
          error,
        );
        return await this.getFallbackProductCounts(categoryIds);
      }

      (data ?? []).forEach((r: any) => {
        if (r?.category_id && categoryIds.includes(r.category_id)) {
          productCounts[r.category_id] = r.product_count ?? 0;
        }
      });

      return productCounts;
    } catch (e) {
      console.warn('Error getting product counts, fallback:', e);
      return await this.getFallbackProductCounts(categoryIds);
    }
  }

  private async getFallbackProductCounts(
    categoryIds: string[],
  ): Promise<Record<string, number>> {
    const productCounts: Record<string, number> = {};
    categoryIds.forEach((id) => (productCounts[id] = 0));

    // This fallback assumes:
    // - products.category_id exists
    // - optional join table product_categories(product_id, category_id) exists
    for (const categoryId of categoryIds) {
      try {
        const { data, error } = await this.supabaseService.client
          .from('products')
          .select(
            `
              id,
              category_id,
              product_categories!left(category_id)
            `,
          )
          .eq('is_active', true)
          .or(
            `category_id.eq.${categoryId},product_categories.category_id.eq.${categoryId}`,
          );

        if (error || !data) continue;

        const distinctIds = new Set<string>();
        data.forEach((p: any) => {
          if (p.category_id === categoryId) distinctIds.add(p.id);

          const pcs = Array.isArray(p.product_categories)
            ? p.product_categories
            : p.product_categories
              ? [p.product_categories]
              : [];

          if (pcs.some((pc: any) => pc.category_id === categoryId)) {
            distinctIds.add(p.id);
          }
        });

        productCounts[categoryId] = distinctIds.size;
      } catch (err) {
        console.warn(`Fallback count failed for ${categoryId}:`, err);
      }
    }

    return productCounts;
  }

  private createSlug(name: string): string {
    return (name ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private getDefaultCategoryImage(slug: string): string {
    const imageMap: Record<string, string> = {
      'solarni-paneli':
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
      'mrezni-pretvaraci':
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      baterije:
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=500&fit=crop',
    };

    return (
      imageMap[slug] ||
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop'
    );
  }
}