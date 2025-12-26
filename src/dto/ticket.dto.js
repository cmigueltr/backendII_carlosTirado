export class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id || ticket.id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
    this.products = ticket.products?.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price
    })) || [];
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }

  static fromTicket(ticket) {
    if (!ticket) return null;
    return new TicketDTO(ticket);
  }

  static fromTickets(tickets) {
    return tickets.map(ticket => TicketDTO.fromTicket(ticket));
  }
}

