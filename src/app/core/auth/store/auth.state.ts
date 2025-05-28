import { User } from '../../../shared/models/user.model';

export interface AuthState {
    loading: boolean;
    loggedIn: boolean;
    token: string | null;
    user: User | null;
    error: any;
    passwordResetSuccessMessage: string | null;
}

export const initialAuthState: AuthState = {
    loading: false,
    loggedIn: false,
    token: null,
    user: null,
    error: null,
    passwordResetSuccessMessage: null
};