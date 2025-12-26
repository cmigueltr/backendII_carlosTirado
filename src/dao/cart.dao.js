import Cart from '../models/cart.model.js';

export class CartDAO {
  static async findByUserId(userId) {
    return await Cart.findOne({ user: userId }).populate('products.product');
  }

  static async create(cartData) {
    return await Cart.create(cartData);
  }

  static async updateByUserId(userId, updateData) {
    return await Cart.findOneAndUpdate({ user: userId }, updateData, { new: true });
  }

  static async deleteByUserId(userId) {
    return await Cart.findOneAndDelete({ user: userId });
  }

  static async clearCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { products: [] },
      { new: true }
    );
  }
}

