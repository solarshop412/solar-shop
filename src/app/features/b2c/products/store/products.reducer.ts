import { createReducer, on } from '@ngrx/store';
import { ProductsActions } from './products.actions';
import { ProductsState, initialProductsState } from './products.state';

export const productsReducer = createReducer(
    initialProductsState,
    on(ProductsActions.loadProductCategories, (state) => ({
        ...state,
        isLoading: true,
        error: null,
    })),
    on(ProductsActions.loadProductCategoriesSuccess, (state, { categories }) => ({
        ...state,
        categories,
        isLoading: false,
        error: null,
    })),
    on(ProductsActions.loadProductCategoriesFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error,
    }))
); 