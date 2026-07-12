import axios from 'axios';

const djangoApi = axios.create({
    baseURL: process.env.DJANGO_API,
    headers: {
        Authorization: `Bearer ${process.env.DJANGO_API_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

export async function getOrder(orderId: string) {
    const response = await djangoApi.get(
        `/payments/orders/${orderId}/`,
    );

    return response.data;
}

export async function completeOrder(
    orderId: string,
    stripeCheckoutSessionId: string,
    stripePaymentIntentId: string,
) {
    const response = await djangoApi.patch(
        `/payments/orders/${orderId}/complete/`,
        {
            stripe_checkout_session_id: stripeCheckoutSessionId,
            stripe_payment_intent_id: stripePaymentIntentId,
        },
    );

    return response.data;
}