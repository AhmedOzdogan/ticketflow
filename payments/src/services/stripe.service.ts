import { getOrder } from './django.service';
import stripe from "../config/stripe"

export async function createStripeCheckoutSession(
    orderId: string,
) {
    const order = await getOrder(orderId);

    if (order.status !== 'pending') {
        throw new Error('Order is no longer pending.');
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',

        payment_method_types: ['card'],

        line_items: order.items.map((item: any) => ({
            quantity: item.quantity,

            price_data: {
                currency: order.currency.toLowerCase(),

                unit_amount: Math.round(
                    Number(item.unit_price) * 100,
                ),

                product_data: {
                    name: item.ticket_type_name,
                },
            },
        })),

        client_reference_id: order.id,

        metadata: {
            order_id: order.id,
        },

        success_url:
            'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',

        cancel_url:
            'http://localhost:5173/payment/failed',
    });

    return {
        checkout_url: session.url,
        session_id: session.id,
    };
}