import { ProductCategory } from '../services/categories.service';

export interface ProductsState {
    categories: ProductCategory[];
    isLoading: boolean;
    error: string | null;
}

export const initialProductsState: ProductsState = {
    categories: [],
    isLoading: false,
    error: null,
}; 