import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductListState } from './product-list.reducer';
import { Product, SortOption } from '../product-list.component';

export const selectProductListState = createFeatureSelector<ProductListState>('productList');

export const selectProducts = createSelector(
    selectProductListState,
    (state) => state.products
);

export const selectIsLoading = createSelector(
    selectProductListState,
    (state) => state.loading
);

export const selectFilters = createSelector(
    selectProductListState,
    (state) => state.filters
);

export const selectSortOption = createSelector(
    selectProductListState,
    (state) => state.sortOption
);

export const selectCategories = createSelector(
    selectProducts,
    (products: Product[]) => {
        const categories = products.map(product => product.category);
        return [...new Set(categories)].sort();
    }
);

export const selectManufacturers = createSelector(
    selectProducts,
    (products: Product[]) => {
        const manufacturers = products.map(product => product.manufacturer);
        return [...new Set(manufacturers)].sort();
    }
);

export const selectCertificates = createSelector(
    selectProducts,
    (products: Product[]) => {
        const certificates = products.flatMap(product => product.certificates);
        return [...new Set(certificates)].sort();
    }
);

export const selectFilteredProducts = createSelector(
    selectProducts,
    selectFilters,
    selectSortOption,
    (products, filters, sortOption) => {
        let filtered = products.filter(product => {
            // Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
                return false;
            }

            // Price range filter
            if (filters.priceRange.min > 0 && product.price < filters.priceRange.min) {
                return false;
            }
            if (filters.priceRange.max > 0 && product.price > filters.priceRange.max) {
                return false;
            }

            // Certificate filter
            if (filters.certificates.length > 0) {
                const hasMatchingCertificate = filters.certificates.some(cert =>
                    product.certificates.includes(cert)
                );
                if (!hasMatchingCertificate) {
                    return false;
                }
            }

            // Manufacturer filter
            if (filters.manufacturers.length > 0 && !filters.manufacturers.includes(product.manufacturer)) {
                return false;
            }

            return true;
        });

        // Apply sorting
        switch (sortOption) {
            case 'featured':
                filtered = filtered.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return b.rating - a.rating;
                });
                break;
            case 'newest':
                filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'name-asc':
                filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-low':
                filtered = filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered = filtered.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        return filtered;
    }
); 