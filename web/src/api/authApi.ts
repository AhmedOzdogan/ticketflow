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
    await api.post(
        '/v1/users/logout/',
        { refresh },
    );
}

interface GetUsersParams {
    role?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
    organizerApprovalStatus?: string;
    isEmailVerified?: boolean;
}

export async function getUsers(params: GetUsersParams = {}) {
    const response = await api.get('/v1/users/', {
        params: {
            role: params.role,
            page: params.page,
            page_size: params.pageSize,
            search: params.search,
            ordering: params.ordering,
            organizer_approval_status: params.organizerApprovalStatus,
            is_email_verified: params.isEmailVerified,
        },
    });

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

export async function createCheckoutSession(orderId: string) {
    const response = await api.post(
        'http://localhost:5001/payment/create-checkout-session',
        {
            order_id: orderId,
        },
    );

    return response.data;
}