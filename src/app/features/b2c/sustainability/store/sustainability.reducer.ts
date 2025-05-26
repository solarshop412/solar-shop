import { createReducer, on } from '@ngrx/store';
import { SustainabilityActions } from './sustainability.actions';
import { SustainabilityState, initialSustainabilityState } from './sustainability.state';

export const sustainabilityReducer = createReducer(
    initialSustainabilityState,
    on(SustainabilityActions.loadFeatures, (state) => ({
        ...state,
        error: null,
    })),
    on(SustainabilityActions.loadFeaturesSuccess, (state, { features }) => ({
        ...state,
        features,
        error: null,
    })),
    on(SustainabilityActions.loadFeaturesFailure, (state, { error }) => ({
        ...state,
        error,
    }))
); 