import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductDetailsState } from './product-details.reducer';

export const selectProductDetailsState = createFeatureSelector<ProductDetailsState>('productDetails');

export const selectProduct = createSelector(
    selectProductDetailsState,
    (state) => state.product
);

export const selectIsLoading = createSelector(
    selectProductDetailsState,
    (state) => state.loading
);

export const selectError = createSelector(
    selectProductDetailsState,
    (state) => state.error
); 