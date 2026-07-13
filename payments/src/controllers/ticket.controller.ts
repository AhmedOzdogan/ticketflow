import { AxiosError } from 'axios';

import type { Request, Response } from 'express';

import { getTicket } from '../services/django.service.js';
import { generateTicketPdf } from '../services/pdf.service.js';

export async function downloadTicket(
    req: Request<{ ticketId: string }>,
    res: Response,
) {
    const { ticketId } = req.params;
    const authorization = req.headers.authorization!;

    try {
        const ticket = await getTicket(
            ticketId,
            authorization,
        );

        const pdf = await generateTicketPdf(ticket);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="ticket-${ticket.id}.pdf"`,
        );

        return res.send(pdf);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            if (error.response.status === 404) {
                return res.status(404).json({
                    message: 'Ticket not found.',
                });
            }

            if (error.response.status === 401) {
                return res.status(401).json({
                    message: 'Invalid or expired token.',
                });
            }

            if (error.response.status === 403) {
                return res.status(403).json({
                    message: 'You are not allowed to download this ticket.',
                });
            }

            return res.status(error.response.status).json({
                message: 'Unable to download ticket.',
            });
        }

        return res.status(503).json({
            message: 'Ticket service is unavailable.',
        });
    }
}