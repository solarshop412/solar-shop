import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    productCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryFilters {
    parentId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {

    constructor(private supabaseService: SupabaseService) { }

    getCategories(filters?: CategoryFilters): Observable<ProductCategory[]> {
        return from(this.fetchCategoriesFromSupabase(filters)).pipe(
            catchError(error => {
                console.error('Error fetching categories:', error);
                return of([]);
            })
        );
    }

    getActiveCategories(): Observable<ProductCategory[]> {
        return from(this.fetchActiveCategories()).pipe(
            catchError(error => {
                console.error('Error fetching active categories:', error);
                return of([]);
            })
        );
    }

    getCategoryById(id: string): Observable<ProductCategory | null> {
        return from(this.fetchCategoryById(id)).pipe(
            catchError(error => {
                console.error('Error fetching category:', error);
                return of(null);
            })
        );
    }

    getCategoryBySlug(slug: string): Observable<ProductCategory | null> {
        return from(this.fetchCategoryBySlug(slug)).pipe(
            catchError(error => {
                console.error('Error fetching category by slug:', error);
                return of(null);
            })
        );
    }

    getTopLevelCategories(): Observable<ProductCategory[]> {
        return from(this.fetchTopLevelCategories()).pipe(
            catchError(error => {
                console.error('Error fetching top level categories:', error);
                return of([]);
            })
        );
    }

    getSubCategories(parentId: string): Observable<ProductCategory[]> {
        return from(this.fetchSubCategories(parentId)).pipe(
            catchError(error => {
                console.error('Error fetching subcategories:', error);
                return of([]);
            })
        );
    }

    private async fetchCategoriesFromSupabase(filters?: CategoryFilters): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(filters?.isActive ?? true);

            let filteredCategories = supabaseCategories;

            if (filters?.parentId !== undefined) {
                filteredCategories = filteredCategories.filter(category =>
                    category.parent_id === filters.parentId
                );
            }

            if (filters?.limit) {
                filteredCategories = filteredCategories.slice(0, filters.limit);
            }

            return await this.convertSupabaseCategoriesToLocal(filteredCategories);
        } catch (error) {
            console.error('Error in fetchCategoriesFromSupabase:', error);
            return [];
        }
    }

    private async fetchActiveCategories(): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            return await this.convertSupabaseCategoriesToLocal(supabaseCategories);
        } catch (error) {
            console.error('Error in fetchActiveCategories:', error);
            return [];
        }
    }

    private async fetchCategoryById(id: string): Promise<ProductCategory | null> {
        try {
            const category = await this.supabaseService.getTableById('categories', id);
            if (!category) return null;

            return await this.convertSupabaseCategoryToLocal(category);
        } catch (error) {
            console.error('Error in fetchCategoryById:', error);
            return null;
        }
    }

    private async fetchCategoryBySlug(slug: string): Promise<ProductCategory | null> {
        try {
            const categories = await this.supabaseService.getCategories(true);
            const category = categories.find(c => c.slug === slug);

            if (!category) return null;

            return await this.convertSupabaseCategoryToLocal(category);
        } catch (error) {
            console.error('Error in fetchCategoryBySlug:', error);
            return null;
        }
    }

    private async fetchTopLevelCategories(): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            const topLevelCategories = supabaseCategories.filter(category => !category.parent_id);

            return await this.convertSupabaseCategoriesToLocal(topLevelCategories);
        } catch (error) {
            console.error('Error in fetchTopLevelCategories:', error);
            return [];
        }
    }

    private async fetchSubCategories(parentId: string): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            const subCategories = supabaseCategories.filter(category => category.parent_id === parentId);

            return await this.convertSupabaseCategoriesToLocal(subCategories);
        } catch (error) {
            console.error('Error in fetchSubCategories:', error);
            return [];
        }
    }

    private async convertSupabaseCategoriesToLocal(categories: any[]): Promise<ProductCategory[]> {
        const convertedCategories: ProductCategory[] = [];

        for (const category of categories) {
            const converted = await this.convertSupabaseCategoryToLocal(category);
            if (converted) {
                convertedCategories.push(converted);
            }
        }

        return convertedCategories;
    }

    private async convertSupabaseCategoryToLocal(category: any): Promise<ProductCategory | null> {
        try {
            // Get product count for this category
            const productCount = await this.getProductCountForCategory(category.id);

            return {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                imageUrl: category.image_url || this.getDefaultCategoryImage(category.slug),
                parentId: category.parent_id,
                isActive: category.is_active,
                sortOrder: category.sort_order,
                productCount,
                createdAt: new Date(category.created_at),
                updatedAt: new Date(category.updated_at)
            };
        } catch (error) {
            console.error('Error converting category:', error);
            return null;
        }
    }

    private async getProductCountForCategory(categoryId: string): Promise<number> {
        try {
            const products = await this.supabaseService.getProducts({ categoryId });
            return products.length;
        } catch (error) {
            console.error('Error getting product count for category:', error);
            return 0;
        }
    }

    private getDefaultCategoryImage(slug: string): string {
        const imageMap: { [key: string]: string } = {
            'solar-panels': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
            'inverters': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
            'batteries': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=500&fit=crop',
            'mounting-systems': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&h=500&fit=crop',
            'monitoring': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop'
        };

        return imageMap[slug] || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
    }
} 