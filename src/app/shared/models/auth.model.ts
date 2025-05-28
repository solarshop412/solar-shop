export interface AuthUser {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    phone_confirmed_at?: string;
    created_at: string;
    updated_at: string;
    last_sign_in_at?: string;
    app_metadata?: {
        provider?: string;
        providers?: string[];
    };
    user_metadata?: {
        firstName?: string;
        lastName?: string;
        fullName?: string;
        avatar_url?: string;
        phone?: string;
    };
}

export interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: AuthUser;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface AuthResponse {
    user: AuthUser | null;
    session: AuthSession | null;
    error?: string;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface UpdatePasswordRequest {
    password: string;
    confirmPassword: string;
}

export interface AuthError {
    message: string;
    status?: number;
}

export interface UserProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    created_at: string;
    updated_at: string;
} 