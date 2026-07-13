export type OrderStatus =
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "cancelled"
    | "expired"
    | "refunded";

export type TicketStatus =
    | "active"
    | "used"
    | "cancelled"
    | "refunded";

export interface OrderStats {
    total: number;
    pending: number;
    processing: number;
    paid: number;
    failed: number;
    cancelled: number;
    expired: number;
    refunded: number;
}

export interface TicketStats {
    total: number;
    active: number;
    used: number;
    cancelled: number;
    refunded: number;
}

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
    event_cover_image: string;
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
    event_id: string;
    event_title: string;
    event_slug: string;
    event_cover_image: string;
    ticket_type_id: string;
    ticket_type_name: string;
    qr_code: string;
    status: TicketStatus;
    used_at: string | null;
    created_at: string;
}

export interface PaginatedResponse<T, S = unknown> {
    count: number;
    next: string | null;
    previous: string | null;
    stats: S;
    results: T[];
}

export type OrderListResponse = PaginatedResponse<
    Order,
    OrderStats
>;

export type TicketListResponse = PaginatedResponse<
    Ticket,
    TicketStats
>;

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
    order_id?: string;
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