export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface TicketType {
    id: string;
    name: string;
    description: string;
    price: string;
    total_quantity: number;
    remaining_quantity: number;
}

export interface EventListItem {
    id: string;
    title: string;
    slug: string;
    cover_image: string | null;
    category: string;
    venue_name: string;
    city: string;
    country: string;
    start_date: string;
    organizer_name: string;
    ticket_types: TicketType[];
}

export interface EventDetail extends EventListItem {
    description: string;
    address: string;
    end_date: string;
}

export type EventListResponse = PaginatedResponse<EventListItem>;

export type EventDetailResponse = EventDetail;