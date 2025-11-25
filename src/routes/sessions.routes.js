import { Router } from 'express';
import passport from 'passport';
import { register, login, current } from '../controllers/sessions.controller.js';

const router = Router();

// register
router.post('/register', register);

// login
router.post('/login', login);

// current - valida JWT y devuelve user. Usa estrategia 'current' de passport.
router.get('/current', passport.authenticate('current', { session: false }), current);

export default router;
