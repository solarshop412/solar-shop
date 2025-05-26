import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ProductCategory } from '../products.component';

export const ProductsActions = createActionGroup({
    source: 'Products',
    events: {
        'Load Product Categories': emptyProps(),
        'Load Product Categories Success': props<{ categories: ProductCategory[] }>(),
        'Load Product Categories Failure': props<{ error: string }>(),
    },
}); 