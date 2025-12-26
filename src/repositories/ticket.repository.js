import { TicketDAO } from '../dao/ticket.dao.js';
import crypto from 'crypto';
import { ProductRepository } from './product.repository.js';

export class TicketRepository {
  static generateCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  static async create(purchaserEmail, cartProducts) {
    // Validar stock y calcular total
    const ticketProducts = [];
    let totalAmount = 0;
    const unavailableProducts = [];

    for (const cartItem of cartProducts) {
      const productId = cartItem.product._id || cartItem.product;
      const quantity = cartItem.quantity;

      const stockCheck = await ProductRepository.checkStock(productId, quantity);
      
      if (stockCheck.available) {
        // Actualizar stock
        await ProductRepository.updateStock(productId, quantity);
        const product = stockCheck.product;
        
        ticketProducts.push({
          product: productId,
          quantity,
          price: product.price
        });
        totalAmount += product.price * quantity;
      } else {
        unavailableProducts.push({
          product: productId,
          quantity,
          reason: stockCheck.message
        });
      }
    }

    if (ticketProducts.length === 0) {
      throw new Error('No hay productos disponibles para comprar');
    }

    // Crear ticket solo con productos disponibles
    const code = this.generateCode();
    const ticket = await TicketDAO.create({
      code,
      amount: totalAmount,
      purchaser: purchaserEmail,
      products: ticketProducts
    });

    return {
      ticket,
      unavailableProducts
    };
  }

  static async findById(id) {
    return await TicketDAO.findById(id);
  }

  static async findByCode(code) {
    return await TicketDAO.findByCode(code);
  }

  static async findByPurchaser(email) {
    return await TicketDAO.findByPurchaser(email);
  }
}

