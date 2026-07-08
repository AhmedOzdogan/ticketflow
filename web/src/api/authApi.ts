import axios from 'axios';

import type {
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenResponse,
    RegisterRequest,
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/v1/users/login/`, payload);
    return response.data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/v1/users/register/`, payload);
    return response.data;
}

export async function changePassword(
    payload: ChangePasswordRequest,
    accessToken: string,
) {
    const response = await axios.post(
        `${API_BASE_URL}/v1/users/change-password/`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return response.data;
}

export async function editProfile(payload: Partial<RegisterRequest>, accessToken: string) {
    const response = await axios.patch(
        `${API_BASE_URL}/v1/users/me/`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return response.data;
}

export async function refreshToken(refresh: string): Promise<RefreshTokenResponse> {
    const response = await axios.post<RefreshTokenResponse>(`${API_BASE_URL}/v1/users/token/refresh/`, { refresh });
    return response.data;
}

export async function logout(refresh: string, access: string): Promise<void> {
    await axios.post(
        `${API_BASE_URL}/v1/users/logout/`,
        { refresh },
        {
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );
}

export async function getCurrentOrganizers(accessToken: string) {
    console.log('Fetching current organizers with access token:', accessToken);
    const response = await axios.get(`${API_BASE_URL}/v1/users/organizers/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return response.data;
}

export async function updateOrganizerStatus(
    organizerId: string,
    organizer_approval_status: 'approved' | 'rejected',
    rejectionReason: string | null,
    accessToken: string,
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

    const response = await axios.patch(
        `${API_BASE_URL}/v1/users/organizers/${organizerId}/approve/`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return response.data;
}