import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OffersState } from './offers.state';

export const selectOffersState = createFeatureSelector<OffersState>('offers');

export const selectOffers = createSelector(
    selectOffersState,
    (state: OffersState) => state.offers
);

export const selectIsLoading = createSelector(
    selectOffersState,
    (state: OffersState) => state.isLoading
);

export const selectError = createSelector(
    selectOffersState,
    (state: OffersState) => state.error
); 