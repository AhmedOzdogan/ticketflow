import type { Request, Response } from 'express';
import { AxiosError } from 'axios';
import { createStripeCheckoutSession } from '../services/stripe.service.js';

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

        const authorization = req.headers.authorization!;

        const session = await createStripeCheckoutSession(
            order_id,
            authorization,
        );

        return res.status(200).json(session);
    } catch (error) {
        console.error(error);

        if (error instanceof AxiosError && error.response) {
            if (error.response.status === 400) {
                return res.status(400).json({
                    message: 'The order cannot be paid.',
                });
            }

            if (error.response.status === 401) {
                return res.status(401).json({
                    message: 'Invalid or expired token.',
                });
            }

            if (error.response.status === 403) {
                return res.status(403).json({
                    message: 'You are not allowed to pay for this order.',
                });
            }

            if (error.response.status === 404) {
                return res.status(404).json({
                    message: 'Order not found.',
                });
            }

            return res.status(error.response.status).json({
                message: 'Failed to retrieve the order.',
            });
        }

        if (
            error instanceof Error &&
            error.message === 'Order is no longer pending.'
        ) {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: 'Failed to create checkout session.',
        });
    }
};