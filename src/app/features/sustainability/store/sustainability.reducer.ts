import { createReducer, on } from '@ngrx/store';
import { SustainabilityActions } from './sustainability.actions';
import { SustainabilityState, initialSustainabilityState } from './sustainability.state';

export const sustainabilityReducer = createReducer(
    initialSustainabilityState,
    on(SustainabilityActions.loadFeatures, (state) => ({
        ...state,
        isLoading: true,
        error: null,
    })),
    on(SustainabilityActions.loadFeaturesSuccess, (state, { features }) => ({
        ...state,
        features,
        isLoading: false,
        error: null,
    })),
    on(SustainabilityActions.loadFeaturesFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error,
    }))
); 