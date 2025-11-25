import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

// GET /api/users
export async function listUsers(req, res) {
  const users = await User.find().select('-password');
  res.json({ users });
}

// GET /api/users/:id
export async function getUser(req, res) {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ user });
}

// POST /api/users (create) - optional, but included as CRUD
export async function createUser(req, res) {
  const { first_name, last_name, email, age, password, role } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email ya registrado' });
  const hashed = bcrypt.hashSync(password, SALT_ROUNDS);
  const user = await User.create({ first_name, last_name, email, age, password: hashed, role });
  const safeUser = user.toObject(); delete safeUser.password;
  res.status(201).json({ user: safeUser });
}

// PUT /api/users/:id (update)
export async function updateUser(req, res) {
  const updates = { ...req.body };
  if (updates.password) updates.password = bcrypt.hashSync(updates.password, SALT_ROUNDS);
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ user });
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ message: 'Usuario eliminado' });
}
