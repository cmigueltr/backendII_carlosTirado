import Ticket from '../models/ticket.model.js';

export class TicketDAO {
  static async findById(id) {
    return await Ticket.findById(id).populate('products.product');
  }

  static async findByCode(code) {
    return await Ticket.findOne({ code }).populate('products.product');
  }

  static async findByPurchaser(email) {
    return await Ticket.find({ purchaser: email }).populate('products.product');
  }

  static async create(ticketData) {
    return await Ticket.create(ticketData);
  }

  static async findAll(query = {}) {
    return await Ticket.find(query).populate('products.product');
  }
}

