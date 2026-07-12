// routes/ticket.routes.ts

import { Router } from 'express';
import { downloadTicket } from '../controllers/ticket.controller';

const router = Router();

router.get('/:ticketId/pdf', downloadTicket);

export default router;