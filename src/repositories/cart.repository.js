import { CartDAO } from '../dao/cart.dao.js';
import { ProductRepository } from './product.repository.js';

export class CartRepository {
  static async findByUserId(userId) {
    let cart = await CartDAO.findByUserId(userId);
    if (!cart) {
      // Si no existe, crear uno vacío
      cart = await CartDAO.create({ user: userId, products: [] });
    }
    return cart;
  }

  static async addProduct(userId, productId, quantity = 1) {
    const cart = await this.findByUserId(userId);
    
    // Verificar que el producto existe y tiene stock
    const stockCheck = await ProductRepository.checkStock(productId, quantity);
    if (!stockCheck.available) {
      throw new Error(stockCheck.message);
    }

    // Buscar si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (productIndex >= 0) {
      // Si existe, actualizar la cantidad
      const newQuantity = cart.products[productIndex].quantity + quantity;
      const stockCheckUpdate = await ProductRepository.checkStock(productId, newQuantity);
      if (!stockCheckUpdate.available) {
        throw new Error(stockCheckUpdate.message);
      }
      cart.products[productIndex].quantity = newQuantity;
    } else {
      // Si no existe, agregarlo
      cart.products.push({ product: productId, quantity });
    }

    return await CartDAO.updateByUserId(userId, { products: cart.products });
  }

  static async updateProductQuantity(userId, productId, quantity) {
    const cart = await this.findByUserId(userId);
    
    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el producto
      return await this.removeProduct(userId, productId);
    }

    // Verificar stock
    const stockCheck = await ProductRepository.checkStock(productId, quantity);
    if (!stockCheck.available) {
      throw new Error(stockCheck.message);
    }

    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;
      return await CartDAO.updateByUserId(userId, { products: cart.products });
    }

    throw new Error('Producto no encontrado en el carrito');
  }

  static async removeProduct(userId, productId) {
    const cart = await this.findByUserId(userId);
    cart.products = cart.products.filter(
      item => item.product.toString() !== productId.toString()
    );
    return await CartDAO.updateByUserId(userId, { products: cart.products });
  }

  static async clearCart(userId) {
    return await CartDAO.clearCart(userId);
  }

  static async deleteByUserId(userId) {
    return await CartDAO.deleteByUserId(userId);
  }
}

