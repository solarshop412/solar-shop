import { createReducer, on } from '@ngrx/store';
import { Product } from '../../product-list/product-list.component';
import { ProductDetailsActions } from './product-details.actions';

export interface ProductDetailsState {
    product: Product | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductDetailsState = {
    product: null,
    loading: false,
    error: null
};

export const productDetailsReducer = createReducer(
    initialState,

    on(ProductDetailsActions.loadProduct, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductDetailsActions.loadProductSuccess, (state, { product }) => ({
        ...state,
        product,
        loading: false,
        error: null
    })),

    on(ProductDetailsActions.loadProductFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(ProductDetailsActions.clearProduct, () => initialState)
); 