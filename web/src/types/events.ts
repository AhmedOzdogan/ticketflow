export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface EventListItem {
    id: string;
    title: string;
    slug: string;
    description: string;
    cover_image: string | null;
    cover_image_url?: File | null;
    category: string;
    venue_name: string;
    address: string;
    city: string;
    country: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    organizer_name: string;
    ticket_types: TicketType[];
}

export interface TicketType {
    id: string;
    name: string;
    description: string;
    price: string;
    total_quantity: number;
    remaining_quantity: number;
}

export type PublicTicketType = Omit<TicketType, "id" | "total_quantity">;

export type EventListPublicItem = Omit<
    EventListItem,
    | "id"
    | "end_date"
    | "status"
    | "created_at"
    | "updated_at"
    | "ticket_types"
> & {
    ticket_types: PublicTicketType[];
};

export type EventListPaginatedResponse = PaginatedResponse<EventListItem>;

export type PublicEventListPaginatedResponse = PaginatedResponse<EventListPublicItem>;

export type TicketInput = Omit<TicketType, "id" | "remaining_quantity">;

export interface UpdateTicketInput extends TicketInput {
    id?: string;
}

export interface CreateEvent {
    title: string;
    description: string;
    cover_image: File | null;
    cover_image_url?: string | null;
    category: string;
    venue_name: string;
    address: string;
    city: string;
    country: string;
    start_date: string;
    end_date: string;
    ticket_types: TicketInput[];
}
export type UpdateEvent = Partial<
    Omit<CreateEvent, "ticket_types" | "cover_image">
> & {
    cover_image?: File | null;
    ticket_types?: UpdateTicketInput[];
};