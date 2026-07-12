import axios from 'axios';
import QRCode from 'qrcode';

import { getTicket } from './django.service';
import sharp from 'sharp';

import {
    PDFDocument,
    StandardFonts,
    rgb,
    pushGraphicsState,
    popGraphicsState,
} from 'pdf-lib';

import {
    rectangle,
    clip,
    endPath,
} from 'pdf-lib';

export async function generateTicketPdf(
    ticketId: string,
): Promise<Uint8Array> {
    const ticket = await getTicket(ticketId);

    const pdf = await PDFDocument.create();

    const page = pdf.addPage([900, 400]);

    const { width, height } = page.getSize();

    const titleFont = await pdf.embedFont(
        StandardFonts.HelveticaBold,
    );

    const bodyFont = await pdf.embedFont(
        StandardFonts.Helvetica,
    );

    const mutedColor = rgb(0.42, 0.38, 0.36);
    const borderColor = rgb(0.9, 0.82, 0.76);
    const backgroundColor = rgb(1, 0.98, 0.97);
    const surfaceColor = rgb(1, 1, 1);
    const primaryColor = rgb(0.82, 0.18, 0.31);
    const successColor = rgb(0.09, 0.64, 0.29);

    page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: backgroundColor,
    });

    page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        color: surfaceColor,
        borderWidth: 1,
        borderColor,
    });

    const coverWidth = 260;
    const contentStartX = coverWidth + 50;
    const qrPanelWidth = 190;
    const qrPanelX = width - qrPanelWidth - 40;

    try {
        const imageResponse = await axios.get(
            ticket.event_cover_image,
            {
                responseType: 'arraybuffer',
            },
        );

        const imageBuffer = Buffer.from(imageResponse.data);

        const pngBuffer = await sharp(imageBuffer)
            .png()
            .toBuffer();

        let coverImage = await pdf.embedPng(pngBuffer);

        const imageUrl =
            ticket.event_cover_image.toLowerCase();

        if (imageUrl.endsWith('.png')) {
            coverImage = await pdf.embedPng(
                imageResponse.data,
            );
        } else if (
            imageUrl.endsWith('.jpg') ||
            imageUrl.endsWith('.jpeg')
        ) {
            coverImage = await pdf.embedJpg(
                imageResponse.data,
            );
        }

        if (coverImage) {
            const containerX = 20;
            const containerY = 20;
            const containerWidth = coverWidth;
            const containerHeight = height - 40;

            const imageDimensions = coverImage.scale(1);

            // Cover behaviour
            const scale = Math.max(
                containerWidth / imageDimensions.width,
                containerHeight / imageDimensions.height,
            );

            const imageWidth =
                imageDimensions.width * scale;

            const imageHeight =
                imageDimensions.height * scale;

            const imageX =
                containerX +
                (containerWidth - imageWidth) / 2;

            const imageY =
                containerY +
                (containerHeight - imageHeight) / 2;

            // Clip everything outside the cover area
            page.pushOperators(
                pushGraphicsState(),
                rectangle(
                    containerX,
                    containerY,
                    containerWidth,
                    containerHeight,
                ),
                clip(),
                endPath(),
            );

            page.drawImage(coverImage, {
                x: imageX,
                y: imageY,
                width: imageWidth,
                height: imageHeight,
            });

            page.pushOperators(popGraphicsState());
        }
    } catch {
        page.drawRectangle({
            x: 20,
            y: 20,
            width: coverWidth,
            height: height - 40,
            color: rgb(0.96, 0.92, 0.89),
        });

        page.drawText('EVENT COVER', {
            x: 80,
            y: height / 2,
            size: 18,
            font: titleFont,
            color: mutedColor,
        });
    }

    page.drawLine({
        start: {
            x: 20 + coverWidth,
            y: 20,
        },
        end: {
            x: 20 + coverWidth,
            y: height - 20,
        },
        thickness: 1,
        color: borderColor,
    });

    page.drawText(ticket.event_title, {
        x: contentStartX,
        y: height - 72,
        size: 26,
        font: titleFont,
        color: rgb(0.02, 0.02, 0.02),
    });

    page.drawText(
        `${ticket.ticket_type_name.toUpperCase()} TICKET`,
        {
            x: contentStartX,
            y: height - 103,
            size: 14,
            font: titleFont,
            color: mutedColor,
        },
    );

    const statusText =
        ticket.status.toUpperCase();

    const statusWidth =
        titleFont.widthOfTextAtSize(
            statusText,
            12,
        ) + 28;

    page.drawRectangle({
        x: qrPanelX + qrPanelWidth - statusWidth,
        y: height - 83,
        width: statusWidth,
        height: 30,
        color:
            ticket.status === 'active'
                ? rgb(0.9, 0.97, 0.92)
                : rgb(1, 0.91, 0.91),
    });

    page.drawText(statusText, {
        x:
            qrPanelX +
            qrPanelWidth -
            statusWidth +
            14,
        y: height - 73,
        size: 12,
        font: titleFont,
        color:
            ticket.status === 'active'
                ? successColor
                : primaryColor,
    });

    page.drawLine({
        start: {
            x: contentStartX,
            y: height - 125,
        },
        end: {
            x: width - 40,
            y: height - 125,
        },
        thickness: 1,
        color: borderColor,
    });

    const infoX = contentStartX;
    const labelX = infoX;
    const valueX = infoX + 95;

    const drawInfoRow = (
        label: string,
        value: string,
        y: number,
    ) => {
        page.drawText(label, {
            x: labelX,
            y,
            size: 11,
            font: bodyFont,
            color: mutedColor,
        });

        page.drawText(value, {
            x: valueX,
            y,
            size: 13,
            font: titleFont,
            color: rgb(0.06, 0.06, 0.06),
            maxWidth:
                qrPanelX - valueX - 25,
        });
    };

    drawInfoRow(
        'OWNER',
        ticket.owner_name,
        height - 170,
    );

    drawInfoRow(
        'PURCHASED',
        new Date(
            ticket.created_at,
        ).toLocaleDateString(),
        height - 210,
    );

    drawInfoRow(
        'TICKET ID',
        ticket.id,
        height - 250,
    );

    const qrDataUrl =
        await QRCode.toDataURL(
            ticket.qr_code,
            {
                margin: 1,
                width: 260,
            },
        );

    const qrBytes = Buffer.from(
        qrDataUrl.replace(
            /^data:image\/png;base64,/,
            '',
        ),
        'base64',
    );

    const qrImage = await pdf.embedPng(
        qrBytes,
    );

    page.drawRectangle({
        x: qrPanelX,
        y: 88,
        width: qrPanelWidth,
        height: 210,
        color: backgroundColor,
        borderWidth: 1,
        borderColor,
    });

    page.drawText('QR CODE', {
        x: qrPanelX + 66,
        y: 277,
        size: 11,
        font: titleFont,
        color: mutedColor,
    });

    page.drawImage(qrImage, {
        x: qrPanelX + 25,
        y: 108,
        width: 140,
        height: 140,
    });

    page.drawLine({
        start: {
            x: contentStartX,
            y: 72,
        },
        end: {
            x: width - 40,
            y: 72,
        },
        thickness: 1,
        color: borderColor,
    });

    page.drawText('TicketFlow', {
        x: contentStartX,
        y: 46,
        size: 12,
        font: titleFont,
        color: primaryColor,
    });

    page.drawText(
        'Present this QR code at the entrance.',
        {
            x: width - 270,
            y: 46,
            size: 10,
            font: bodyFont,
            color: mutedColor,
        },
    );

    return pdf.save();
}