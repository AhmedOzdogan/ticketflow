import express from 'express';
import cors from 'cors';

import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

app.use(cors());

// Stripe webhook must receive the raw request body
app.use('/webhook', express.raw({ type: 'application/json' }));

// All other routes use JSON
app.use(express.json());

app.get('/', (_, res) => {
    res.json({
        service: 'TicketFlow Payments API',
        status: 'running',
    });
});

app.use('/payment', paymentRoutes);
app.use('/webhook', webhookRoutes);

export default app;