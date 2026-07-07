import { apiRequest } from './client';

export type UserRole = 'buyer' | 'organizer' | 'admin';

export type AuthUser = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: UserRole;
    is_email_verified: boolean;
    organizer_approval_status: string;
    profile_image_url: string;
    organizer_profile: unknown | null;
};

export type AuthResponse = {
    access: string;
    refresh: string;
    user: AuthUser;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: 'buyer' | 'organizer';
    company_name?: string;
    website_url?: string;
    organizer_details?: string;
};

export function login(payload: LoginRequest) {
    return apiRequest<AuthResponse>('/v1/users/login/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function register(payload: RegisterRequest) {
    return apiRequest<AuthResponse>('/v1/users/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function refreshToken(refresh: string) {
    return apiRequest<{ access: string }>('/users/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
    });
}

export function logout(refresh: string, access: string) {
    return apiRequest<void>('/users/logout/', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
    });
}