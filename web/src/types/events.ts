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

export type TicketInput = Omit<TicketType, "id" | "remaining_quantity">;

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

export interface CreateEvent {
    title: string;
    description: string;
    cover_image: File | null;
    category: string;
    venue_name: string;
    address: string;
    city: string;
    country: string;
    start_date: string;
    end_date: string;
    ticket_types: Array<Omit<TicketType, "id" | "remaining_quantity">>;
}