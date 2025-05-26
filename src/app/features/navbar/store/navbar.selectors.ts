import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavbarState } from './navbar.state';

export const selectNavbarState = createFeatureSelector<NavbarState>('navbar');

export const selectIsMobileMenuOpen = createSelector(
    selectNavbarState,
    (state: NavbarState) => state.isMobileMenuOpen
);

export const selectCurrentLanguage = createSelector(
    selectNavbarState,
    (state: NavbarState) => state.currentLanguage
); 