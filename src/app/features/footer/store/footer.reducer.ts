import { createReducer, on } from '@ngrx/store';
import { FooterActions } from './footer.actions';
import { FooterState, initialFooterState } from './footer.state';

export const footerReducer = createReducer(
    initialFooterState,
    on(FooterActions.loadFooterData, (state) => ({
        ...state,
        isLoading: true,
        error: null,
    })),
    on(FooterActions.loadFooterDataSuccess, (state, { data }) => ({
        ...state,
        data,
        isLoading: false,
        error: null,
    })),
    on(FooterActions.loadFooterDataFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error,
    })),
    on(FooterActions.subscribeNewsletter, (state) => ({
        ...state,
        newsletterSubscriptionStatus: 'loading' as const,
        newsletterMessage: null,
    })),
    on(FooterActions.subscribeNewsletterSuccess, (state, { message }) => ({
        ...state,
        newsletterSubscriptionStatus: 'success' as const,
        newsletterMessage: message,
    })),
    on(FooterActions.subscribeNewsletterFailure, (state, { error }) => ({
        ...state,
        newsletterSubscriptionStatus: 'error' as const,
        newsletterMessage: error,
    }))
); 