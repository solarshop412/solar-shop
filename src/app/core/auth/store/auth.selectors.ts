import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

const authSelector = createFeatureSelector<AuthState>('auth');

export const getLoggedIn = createSelector(
    authSelector,
    auth => !!auth.loggedIn
);

export const getToken = createSelector(
    authSelector,
    auth => auth.token
);

export const selectAuthLoading = createSelector(
    authSelector,
    (state) => state.loading
);

export const selectAuthError = createSelector(
    authSelector,
    (state) => state.error
);

export const selectPasswordResetSuccessMessage = createSelector(
    authSelector,
    (state) => state.passwordResetSuccessMessage
);