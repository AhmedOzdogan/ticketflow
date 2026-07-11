import { api } from './client';

import type {
    EventListItem,
    EventListPaginatedResponse,
    PublicEventListPaginatedResponse,
    EventListPublicItem,
    CreateEvent,
    UpdateEvent,
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
): Promise<PublicEventListPaginatedResponse> {
    const response = await api.get<PublicEventListPaginatedResponse>('/v1/events/', {
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
): Promise<EventListPublicItem> {
    const response = await api.get<EventListPublicItem>(
        `/v1/events/${slug}/`,
    );

    return response.data;
}

// Get organizer's events, or all events for admins
export async function getMyEvents(
    params: GetEventsParams = {},
): Promise<EventListPaginatedResponse> {
    const response = await api.get<EventListPaginatedResponse>('/v1/events/manage/', {
        params: {
            page: params.page,
            page_size: params.pageSize,
            search: params.search,
            category: params.category,
            city: params.city,
            country: params.country,
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
): Promise<EventListItem> {
    const response = await api.get<EventListItem>(
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
): Promise<UpdateEvent> {
    const response = await api.patch<UpdateEvent>(
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
