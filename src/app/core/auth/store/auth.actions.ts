import { createAction, props } from '@ngrx/store';
import { LoginRequest } from '../../../shared/models/login.model';

export const login = createAction('[Auth] Login', props<{ loginRequest: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ token: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>());
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

export const sendResetPasswordEmail = createAction(
    '[Auth] Request Reset Password',
    props<{ email: string }>()
);

export const sendResetPasswordEmailSuccess = createAction(
    '[Auth] Request Reset Password Success'
);

export const sendResetPasswordEmailFailure = createAction(
    '[Auth] Request Reset Password Failure',
    props<{ error: any }>()
);

export const resetPasswordRequest = createAction(
    '[Auth] Reset Password Request',
    props<{ email: string; token: string; newPassword: string, isNewUser: boolean }>()
);

export const resetPasswordSuccess = createAction(
    '[Auth] Reset Password Success'
);

export const resetPasswordFailure = createAction(
    '[Auth] Reset Password Failure',
    props<{ error: any }>()
);