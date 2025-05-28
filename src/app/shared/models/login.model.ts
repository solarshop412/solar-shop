import { User } from './user.model';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterResponse {
    accessToken: string;
    user: User;
}

export interface ResetPassword {
    email: string;
    token: string;
    newPassword: string;
    isNewUser: boolean;
}

export interface ValidateTokenResponse {
    user: User;
    valid: boolean;
}