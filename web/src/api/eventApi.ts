import { api } from './client';

import type {
    EventDetailResponse,
    EventListResponse,
    CreateEvent,
} from '../types/events';

type GetEventsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    city?: string;
    country?: string;
    isFeatured?: boolean;
    ordering?: string;
    startDateGte?: string;
    startDateLte?: string;
};

// Get published events for homepage
export async function getEvents(
    params: GetEventsParams = {},
): Promise<EventListResponse> {
    const response = await api.get<EventListResponse>('/v1/events/', {
        params: {
            page: params.page,
            page_size: params.pageSize,
            search: params.search,
            category: params.category,
            city: params.city,
            country: params.country,
            is_featured: params.isFeatured,
            ordering: params.ordering,
            start_date__gte: params.startDateGte,
            start_date__lte: params.startDateLte,
        },
    });

    return response.data;
}

// Get only published event details
export async function getEventDetails(
    slug: string,
): Promise<EventDetailResponse> {
    const response = await api.get<EventDetailResponse>(
        `/v1/events/${slug}/`,
    );

    return response.data;
}

// Get organizer's events, or all events for admins
export async function getMyEvents(
    params: GetEventsParams = {},
): Promise<EventListResponse> {
    const response = await api.get<EventListResponse>('/v1/events/manage/', {
        params: {
            page: params.page,
            page_size: params.pageSize,
            search: params.search,
            category: params.category,
            city: params.city,
            country: params.country,
            is_featured: params.isFeatured,
            ordering: params.ordering,
            start_date__gte: params.startDateGte,
            start_date__lte: params.startDateLte,
        },
    });

    return response.data;
}

// Get one manageable event for edit page
export async function getManageEventDetails(
    id: number | string,
): Promise<EventDetailResponse> {
    const response = await api.get<EventDetailResponse>(
        `/v1/events/manage/${id}/`,
    );

    return response.data;
}

// Create event for admins and organizers
export async function createEvent(payload: FormData): Promise<CreateEvent> {
    const response = await api.post<CreateEvent>(
        '/v1/events/manage/',
        payload,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );

    return response.data;
}

// Edit event for admins and organizers
export async function editEvent(
    id: number | string,
    payload: FormData,
): Promise<CreateEvent> {
    const response = await api.patch<CreateEvent>(
        `/v1/events/manage/${id}/`,
        payload,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );

    return response.data;
}
