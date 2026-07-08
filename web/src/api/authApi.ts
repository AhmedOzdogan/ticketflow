import { api } from './client';

import type {
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenResponse,
    RegisterRequest,
} from '../types/auth';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/v1/users/login/', payload);
    return response.data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/v1/users/register/', payload);
    return response.data;
}

export async function changePassword(
    payload: ChangePasswordRequest,
) {
    const response = await api.post(
        '/v1/users/change-password/',
        payload,
    );

    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get('/v1/users/me/');

    return response.data;
}
export async function refreshTokenRequest(refresh: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/v1/users/token/refresh/', { refresh });
    return response.data;
}

export async function editProfile(payload: Partial<RegisterRequest>) {
    const response = await api.patch(
        '/v1/users/me/',
        payload,
    );

    return response.data;
}

export async function refreshToken(refresh: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/v1/users/token/refresh/', { refresh });
    return response.data;
}

export async function logout(refresh: string): Promise<void> {
    console.log("refresh token is", refresh)
    await api.post(
        '/v1/users/logout/',
        { refresh },
    );
}

export async function getCurrentOrganizers() {
    const response = await api.get('/v1/users/organizers/');

    return response.data;
}

export async function updateOrganizerStatus(
    organizerId: string,
    organizer_approval_status: 'approved' | 'rejected',
    rejectionReason: string | null,
) {
    if (
        organizer_approval_status === 'rejected' &&
        !rejectionReason?.trim()
    ) {
        throw new Error('Rejection reason is required.');
    }

    const payload: {
        organizer_approval_status: 'approved' | 'rejected';
        rejection_reason?: string;
    } = {
        organizer_approval_status,
    };

    if (organizer_approval_status === 'rejected') {
        payload.rejection_reason = rejectionReason!;
    }

    const response = await api.patch(
        `/v1/users/organizers/${organizerId}/approve/`,
        payload,
    );

    return response.data;
}