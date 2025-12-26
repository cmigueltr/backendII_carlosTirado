import { UserRepository } from '../repositories/user.repository.js';
import { UserDTO } from '../dto/user.dto.js';

// GET /api/users
export async function listUsers(req, res) {
  try {
    const users = await UserRepository.findAll();
    const usersDTO = UserDTO.fromUsers(users);
    res.json({ users: usersDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/users/:id
export async function getUser(req, res) {
  try {
    const user = await UserRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const userDTO = UserDTO.fromUser(user);
    res.json({ user: userDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/users (create)
export async function createUser(req, res) {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const exists = await UserRepository.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });
    
    const user = await UserRepository.create({ first_name, last_name, email, age, password, role });
    const userDTO = UserDTO.fromUser(user);
    res.status(201).json({ user: userDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/users/:id (update)
export async function updateUser(req, res) {
  try {
    const user = await UserRepository.updateById(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const userDTO = UserDTO.fromUser(user);
    res.json({ user: userDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  try {
    const user = await UserRepository.deleteById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
