export interface AuthState {
    loading: boolean;
    loggedIn: boolean;
    token: string | null;
    error: any;
    passwordResetSuccessMessage: string | null;
}