import { Router } from 'express';
import { createCheckoutSession } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.post(
    '/create-checkout-session',
    requireAuth(['buyer']),
    createCheckoutSession);

export default router;