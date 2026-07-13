// routes/ticket.routes.ts

import { Router } from 'express';
import { downloadTicket } from '../controllers/ticket.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.get('/:ticketId/pdf',
    requireAuth(['buyer']),
    downloadTicket);

export default router;