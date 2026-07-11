export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'expired'
    | 'refunded';

export type TicketStatus =
    | 'active'
    | 'used'
    | 'cancelled'
    | 'refunded';

export interface OrderItemCreate {
    ticket_type: string;
    quantity: number;
}

export interface CreateOrderRequest {
    event: string;
    items: OrderItemCreate[];
}

export interface OrderItem {
    id: string;
    ticket_type_id: string;
    ticket_type_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    created_at: string;
}

export interface Order {
    id: string;
    event_id: string;
    event_title: string;
    status: OrderStatus;
    total_price: string;
    currency: string;
    items: OrderItem[];
    created_at: string;
    paid_at: string | null;
    updated_at: string;
}

export interface Ticket {
    id: string;
    owner_email: string;
    event: string;
    ticket_type: string;
    status: TicketStatus;
    used_at: string | null;
    created_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export type OrderListResponse = PaginatedResponse<Order>;
export type TicketListResponse = PaginatedResponse<Ticket>;

export interface GetOrdersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: OrderStatus;
    event?: string;
    ordering?: string;
    totalPriceGte?: number;
    totalPriceLte?: number;
    createdAtGte?: string;
    createdAtLte?: string;
    paidAtGte?: string;
    paidAtLte?: string;
}

export interface GetTicketsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: TicketStatus;
    event?: string;
    ticketType?: string;
    ordering?: string;
    createdAtGte?: string;
    createdAtLte?: string;
    usedAtGte?: string;
    usedAtLte?: string;
}