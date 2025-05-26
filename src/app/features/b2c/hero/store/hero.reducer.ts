import { createReducer, on } from '@ngrx/store';
import { HeroActions } from './hero.actions';
import { HeroState, initialHeroState } from './hero.state';

export const heroReducer = createReducer(
    initialHeroState,
    on(HeroActions.initializeHero, (state) => ({
        ...state,
    })),
    on(HeroActions.setLoading, (state, { isLoading }) => ({
        ...state,
        isLoading,
    })),
    on(HeroActions.exploreProducts, (state) => ({
        ...state,
        isLoading: true,
    }))
); 