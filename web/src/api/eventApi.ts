import { api } from './client';

import type {
    EventDetailResponse,
    EventListResponse,
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

export async function getEventDetails(
    slug: string,
): Promise<EventDetailResponse> {
    const response = await api.get<EventDetailResponse>(
        `/v1/events/${slug}/`,
    );

    return response.data;
}