import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FooterState } from './footer.state';

export const selectFooterState = createFeatureSelector<FooterState>('footer');

export const selectFooterData = createSelector(
    selectFooterState,
    (state: FooterState) => state.data
);

export const selectIsLoading = createSelector(
    selectFooterState,
    (state: FooterState) => state.isLoading
);

export const selectError = createSelector(
    selectFooterState,
    (state: FooterState) => state.error
);

export const selectNewsletterSubscriptionStatus = createSelector(
    selectFooterState,
    (state: FooterState) => state.newsletterSubscriptionStatus
);

export const selectNewsletterMessage = createSelector(
    selectFooterState,
    (state: FooterState) => state.newsletterMessage
); 