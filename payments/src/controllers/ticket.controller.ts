// controllers/ticket.controller.ts

import { Request, Response } from 'express';
import { generateTicketPdf } from '../services/pdf.service';

export async function downloadTicket(
    req: Request<{ ticketId: string | string[] }>,
    res: Response,
) {
    const ticketId = Array.isArray(req.params.ticketId)
        ? req.params.ticketId[0]
        : req.params.ticketId;

    const pdf = await generateTicketPdf(ticketId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=ticket-${ticketId}.pdf`,
    );

    res.send(pdf);
}