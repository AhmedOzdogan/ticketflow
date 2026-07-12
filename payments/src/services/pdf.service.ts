import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';

import { getTicket } from './django.service';

export async function generateTicketPdf(
    ticketId: string,
) {
    const ticket = await getTicket(ticketId);

    const pdf = await PDFDocument.create();

    const page = pdf.addPage([595, 842]);

    page.drawText(ticket.event_title, {
        x: 40,
        y: 780,
        size: 26,
    });

    page.drawText(ticket.ticket_type_name, {
        x: 40,
        y: 740,
        size: 18,
    });

    page.drawText(
        `Ticket ID: ${ticket.id}`,
        {
            x: 40,
            y: 700,
            size: 12,
        },
    );

    const qr = await QRCode.toDataURL(
        ticket.qr_code,
    );

    // we'll draw the QR here next

    return await pdf.save();
}