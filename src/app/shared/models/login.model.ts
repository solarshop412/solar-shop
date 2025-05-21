export interface LoginRequest {
    email: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
}

export interface ResetPassword {
    email: string;
    token: string;
    newPassword: string;
    isNewUser: boolean;
}