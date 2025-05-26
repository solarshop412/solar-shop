import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ProductDetailsActions } from './product-details.actions';
import { ProductListService } from '../../product-list/services/product-list.service';

@Injectable()
export class ProductDetailsEffects {
    private actions$ = inject(Actions);
    private productListService = inject(ProductListService);

    loadProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductDetailsActions.loadProduct),
            switchMap(({ productId }) =>
                this.productListService.getProductById(productId).pipe(
                    map(product => {
                        if (product) {
                            return ProductDetailsActions.loadProductSuccess({ product });
                        } else {
                            return ProductDetailsActions.loadProductFailure({ error: 'Product not found' });
                        }
                    }),
                    catchError((error: any) =>
                        of(ProductDetailsActions.loadProductFailure({
                            error: error.message || 'Failed to load product'
                        }))
                    )
                )
            )
        )
    );
} 