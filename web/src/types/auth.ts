import type { User, UserRole } from './user';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;

    password: string;
    confirm_password: string;

    first_name: string;
    last_name: string;

    phone_number: string;

    role: Exclude<UserRole, 'admin'>;

    company_name?: string;
    website_url?: string;
    organizer_details?: string;
}

export interface JwtTokens {
    access: string;
    refresh: string;

}

export interface AuthResponse extends JwtTokens {
    user: User;
}

export interface RefreshTokenRequest {
    refresh: string;
}

export interface RefreshTokenResponse {
    access: string;
}

export interface LogoutRequest {
    refresh: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    profile_image_url?: string;
}