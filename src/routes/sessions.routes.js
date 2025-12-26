import { Router } from 'express';
import { register, login, current, requestPasswordReset, resetPassword } from '../controllers/sessions.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// register
router.post('/register', register);

// login
router.post('/login', login);

// current - valida JWT y devuelve user. Usa estrategia 'current' de passport.
router.get('/current', authenticate, current);

// password reset
router.post('/password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
