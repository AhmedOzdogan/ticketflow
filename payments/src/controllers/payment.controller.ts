import { Request, Response } from 'express';

import { createStripeCheckoutSession } from '../services/stripe.service';

export const createCheckoutSession = async (
    req: Request,
    res: Response,
) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                message: 'order_id is required.',
            });
        }

        const session = await createStripeCheckoutSession(order_id);

        return res.status(200).json(session);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to create checkout session.',
        });
    }
};