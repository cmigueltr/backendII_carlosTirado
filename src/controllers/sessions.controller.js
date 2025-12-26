import passport from 'passport';
import { UserRepository } from '../repositories/user.repository.js';
import { UserDTO } from '../dto/user.dto.js';
import { generateToken } from '../utils/jwt.util.js';
import { PasswordService } from '../services/password.service.js';

// Register - crea usuario usando Repository
export async function register(req, res) {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const exists = await UserRepository.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });

    const user = await UserRepository.create({
      first_name,
      last_name,
      email,
      age,
      password
    });

    const userDTO = UserDTO.fromUser(user);
    return res.status(201).json({ user: userDTO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en registro' });
  }
}

// Login - usa passport local; devolvemos token JWT
export async function login(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'No autorizado' });

    const token = generateToken(user);
    const userDTO = UserDTO.fromUser(user);
    return res.json({ token, user: userDTO });
  })(req, res, next);
}

// Current - usa estrategia 'current' para validar JWT y devolver user con DTO
export function current(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });
  
  const userDTO = UserDTO.fromUser(req.user);
  return res.json({ user: userDTO });
}

// Request password reset
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const result = await PasswordService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    const result = await PasswordService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    if (error.message === 'Token inválido o expirado' || error.message === 'La nueva contraseña no puede ser igual a la anterior') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}
