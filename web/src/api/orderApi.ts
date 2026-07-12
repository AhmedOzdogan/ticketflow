import { api } from './client';
import axios from 'axios';

import type {
    CreateOrderRequest,
    GetOrdersParams,
    GetTicketsParams,
    Order,
    OrderListResponse,
    Ticket,
    TicketListResponse,
} from '../types/order';

// Create a new order
export async function createOrder(
    data: CreateOrderRequest,
): Promise<Order> {
    const response = await api.post<Order>(
        '/v1/orders/create/',
        data,
    );
    return response.data;
}

// Return orders based on the authenticated user's role
export async function getOrders(
    params: GetOrdersParams = {},
): Promise<OrderListResponse> {
    const response = await api.get<OrderListResponse>(
        '/v1/orders/',
        {
            params: {
                page: params.page,
                page_size: params.pageSize,
                search: params.search,
                status: params.status,
                event: params.event,
                ordering: params.ordering,
                total_price__gte: params.totalPriceGte,
                total_price__lte: params.totalPriceLte,
                created_at__gte: params.createdAtGte,
                created_at__lte: params.createdAtLte,
                paid_at__gte: params.paidAtGte,
                paid_at__lte: params.paidAtLte,
            },
        },
    );

    return response.data;
}

// Return a specific order
export async function getOrder(
    id: string,
): Promise<Order> {
    const response = await api.get<Order>(
        `/v1/orders/${id}/`,
    );

    return response.data;
}

export async function cancelOrder(
    orderId: string,
): Promise<void> {
    await api.put(
        `/v1/orders/${orderId}/cancel/`,
    );
}

// Return tickets based on the authenticated user's role
export async function getTickets(
    params: GetTicketsParams = {},
): Promise<TicketListResponse> {
    const response = await api.get<TicketListResponse>(
        '/v1/orders/tickets/',
        {
            params: {
                page: params.page,
                page_size: params.pageSize,
                search: params.search,
                status: params.status,
                event: params.event,
                ticket_type: params.ticketType,
                ordering: params.ordering,
                created_at__gte: params.createdAtGte,
                created_at__lte: params.createdAtLte,
                used_at__gte: params.usedAtGte,
                used_at__lte: params.usedAtLte,
            },
        },
    );

    return response.data;
}

// Check in a ticket by scanning its QR code
export async function scanTicket(
    qrCode: string,
): Promise<Ticket> {
    const response = await api.patch<Ticket>(
        `/v1/orders/tickets/${qrCode}/scan/`,
        {},
    );

    return response.data;
}

export async function downloadTicket(
    ticketId: string,
): Promise<Blob> {
    const response = await axios.get<Blob>(
        `http://localhost:5001/api/tickets/${ticketId}/pdf`,
        {
            responseType: 'blob',
        },
    );

    return response.data;
}