import cors from 'cors';
import express from 'express';

import paymentRoutes from './routes/payment.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
        ],
    }),
);

// Stripe webhook must receive the raw request body.
app.use(
    '/webhook',
    express.raw({ type: 'application/json' }),
    webhookRoutes,
);

// All other routes use JSON.
app.use(express.json());

app.get('/', (_, res) => {
    return res.json({
        service: 'TicketFlow Payments API',
        status: 'running',
    });
});

app.use('/payment', paymentRoutes);
app.use('/api/tickets', ticketRoutes);

export default app;