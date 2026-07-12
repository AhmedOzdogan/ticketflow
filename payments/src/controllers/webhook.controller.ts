import { Request, Response } from 'express';
import { completeOrder } from '../services/django.service';
import stripe from '../config/stripe';
import Stripe from 'stripe';

export const stripeWebhook = async (
    req: Request,
    res: Response,
) => {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
        return res.status(400).send('Missing Stripe signature.');
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string,
        );
    } catch (error) {
        console.error(error);

        return res.status(400).send('Invalid webhook signature.');
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log(
                'Checkout completed:',
                session.metadata?.order_id,
            );

            const orderId = session.metadata?.order_id;

            if (!orderId) {
                return res.status(400).send('Missing order ID.');
            }

            await completeOrder(
                orderId,
                session.id,
                session.payment_intent as string,
            );

            break;
        }

        default:
            console.log(`Unhandled event: ${event.type}`);
    }

    return res.status(200).json({
        received: true,
    });
};