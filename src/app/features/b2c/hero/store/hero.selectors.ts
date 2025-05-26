import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HeroState } from './hero.state';

export const selectHeroState = createFeatureSelector<HeroState>('hero');

export const selectIsLoading = createSelector(
    selectHeroState,
    (state: HeroState) => state.isLoading
);

export const selectCurrentSlide = createSelector(
    selectHeroState,
    (state: HeroState) => state.currentSlide
);

export const selectTotalSlides = createSelector(
    selectHeroState,
    (state: HeroState) => state.totalSlides
); 