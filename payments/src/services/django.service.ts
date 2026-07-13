import '../config/env';
import axios from 'axios';

const serviceApi = axios.create({
    baseURL: process.env.DJANGO_API,
    headers: {
        Authorization: `Bearer ${process.env.DJANGO_API_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

const userApi = axios.create({
    baseURL: process.env.DJANGO_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function getOrder(
    orderId: string,
    accessToken: string,
) {
    const response = await userApi.get(
        `/orders/payments/${orderId}/`,
        {
            headers: {
                Authorization: accessToken,
            },
        },
    );

    return response.data;
}

export async function completeOrder(
    orderId: string,
    stripeCheckoutSessionId: string,
    stripePaymentIntentId: string,
) {
    const response = await serviceApi.patch(
        `/orders/payments/${orderId}/complete/`,
        {
            stripe_checkout_session_id: stripeCheckoutSessionId,
            stripe_payment_intent_id: stripePaymentIntentId,
        },
    );

    return response.data;
}

export async function getTicket(
    ticketId: string,
    accessToken: string,
) {
    const response = await userApi.get(
        `/orders/tickets/${ticketId}/download/`,
        {
            headers: {
                Authorization: accessToken,
            },
        },
    );

    return response.data;
}