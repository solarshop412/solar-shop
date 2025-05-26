import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.state';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProductCategories = createSelector(
    selectProductsState,
    (state: ProductsState) => state.categories
);

export const selectIsLoading = createSelector(
    selectProductsState,
    (state: ProductsState) => state.isLoading
);

export const selectError = createSelector(
    selectProductsState,
    (state: ProductsState) => state.error
); 