import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SustainabilityState } from './sustainability.state';

export const selectSustainabilityState = createFeatureSelector<SustainabilityState>('sustainability');

export const selectFeatures = createSelector(
    selectSustainabilityState,
    (state: SustainabilityState) => state.features
);

export const selectIsLoading = createSelector(
    selectSustainabilityState,
    (state: SustainabilityState) => state.isLoading
);

export const selectError = createSelector(
    selectSustainabilityState,
    (state: SustainabilityState) => state.error
); 