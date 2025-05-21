import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState } from './auth.state';

const initialState: AuthState = {
    loading: false,
    loggedIn: false,
    token: null,
    error: null,
    passwordResetSuccessMessage: null
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.login, state => ({
        ...state,
        loading: true
    })),
    on(AuthActions.loginSuccess, (state, { token }) => ({
        ...state,
        loading: false,
        loggedIn: true,
        token
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(AuthActions.logout, state => ({
        ...state,
        loggedIn: false,
        token: null
    })),
    on(AuthActions.sendResetPasswordEmail, state => ({
        ...state,
        loading: true
    })),
    on(AuthActions.sendResetPasswordEmailSuccess, state => ({
        ...state,
        loading: false
    })),
    on(AuthActions.sendResetPasswordEmailFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(AuthActions.resetPasswordRequest, state => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.resetPasswordSuccess, state => ({
        ...state,
        loading: false,
        passwordResetSuccessMessage: 'Password reset successfully. Redirecting you to login in a few moments.',
    })),
    on(AuthActions.resetPasswordFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
