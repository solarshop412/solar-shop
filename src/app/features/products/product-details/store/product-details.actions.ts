import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product } from '../../product-list/product-list.component';

export const ProductDetailsActions = createActionGroup({
    source: 'Product Details',
    events: {
        'Load Product': props<{ productId: string }>(),
        'Load Product Success': props<{ product: Product }>(),
        'Load Product Failure': props<{ error: string }>(),
        'Clear Product': emptyProps(),
    }
}); 