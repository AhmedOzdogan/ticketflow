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

        return res.status(400).send('Invalid webhook signature.');
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            if (!session.metadata?.order_id) {
                return res.status(400).send('Missing order ID.');
            }

            const orderId = session.metadata?.order_id;

            if (typeof session.payment_intent !== 'string') {

                return res.status(400).send('Missing payment intent.');

            }

            try {
                await completeOrder(
                    orderId,
                    session.id,
                    session.payment_intent,
                );
            } catch (error) {
                return res.status(500).send('Failed to complete order.');
            }
            break;
        }

        default:
            console.log(`Unhandled event: ${event.type}`);
    }

    return res.status(200).json({
        received: true,
    });
};