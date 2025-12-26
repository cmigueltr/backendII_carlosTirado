import { UserDAO } from '../dao/user.dao.js';
import bcrypt from 'bcrypt';

export class UserRepository {
  static async findById(id) {
    return await UserDAO.findById(id);
  }

  static async findByEmail(email) {
    return await UserDAO.findByEmail(email);
  }

  static async findAll() {
    return await UserDAO.findAll();
  }

  static async create(userData) {
    // Lógica de negocio: hashear password antes de crear
    if (userData.password) {
      const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
      userData.password = bcrypt.hashSync(userData.password, SALT_ROUNDS);
    }
    return await UserDAO.create(userData);
  }

  static async updateById(id, updateData) {
    // Lógica de negocio: hashear password si se actualiza
    if (updateData.password) {
      const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
      updateData.password = bcrypt.hashSync(updateData.password, SALT_ROUNDS);
    }
    return await UserDAO.updateById(id, updateData);
  }

  static async deleteById(id) {
    return await UserDAO.deleteById(id);
  }

  static async updateResetToken(userId, token, expires) {
    return await UserDAO.updateResetToken(userId, token, expires);
  }

  static async findByResetToken(token) {
    return await UserDAO.findByResetToken(token);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  static async checkPasswordChanged(newPassword, currentPasswordHash) {
    return bcrypt.compareSync(newPassword, currentPasswordHash);
  }
}

