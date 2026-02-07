import { Router } from 'express';
import {
  purchase,
  getTickets,
  getTicketById
} from '../controllers/ticket.controller.js';
import { requireUser, authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/tickets - Solo usuarios pueden comprar
router.post('/', requireUser, purchase);

// GET /api/tickets - Ver mis tickets (usuarios) o todos (admin)
router.get('/', authenticate, getTickets);

// GET /api/tickets/:id - Ver ticket específico
router.get('/:id', authenticate, getTicketById);

export default router;




