import bcrypt from 'bcrypt';
import passport from 'passport';
import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.util.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

// Register - crea usuario y guarda password como hashSync
export async function register(req, res) {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });

    const hashed = bcrypt.hashSync(password, SALT_ROUNDS);

    const user = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashed
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en registro' });
  }
}

// Login - usa passport local o manual; devolvemos token JWT
export async function login(req, res, next) {
  // Usamos passport local para validar
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'No autorizado' });

    // user es safeUser (sin password)
    const token = generateToken(user);
    return res.json({ token, user });
  })(req, res, next);
}

// Current - usa estrategia 'current' para validar JWT y devolver user
export function current(req, res, next) {
  // passport middleware put user on req.user
  // in routes we call passport.authenticate('current', { session:false })
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });
  return res.json({ user: req.user });
}
