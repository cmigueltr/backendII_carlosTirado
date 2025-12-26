import User from '../models/user.model.js';

export class UserDAO {
  static async findById(id) {
    return await User.findById(id);
  }

  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  static async findAll() {
    return await User.find();
  }

  static async create(userData) {
    return await User.create(userData);
  }

  static async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  static async updateResetToken(userId, token, expires) {
    return await User.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    }, { new: true });
  }

  static async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }
}

