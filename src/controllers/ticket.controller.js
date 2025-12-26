import { TicketRepository } from '../repositories/ticket.repository.js';
import { CartRepository } from '../repositories/cart.repository.js';
import { TicketDTO } from '../dto/ticket.dto.js';

export async function purchase(req, res) {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Obtener carrito del usuario
    const cart = await CartRepository.findByUserId(userId);
    
    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Crear ticket (valida stock y actualiza)
    const result = await TicketRepository.create(userEmail, cart.products);

    // Limpiar carrito después de la compra exitosa
    // Mantener solo productos no disponibles
    if (result.unavailableProducts.length > 0) {
      // Si hay productos no disponibles, mantener solo esos en el carrito
      const unavailableProductIds = result.unavailableProducts.map(p => p.product.toString());
      const remainingProducts = cart.products.filter(
        item => {
          const productId = (item.product._id || item.product).toString();
          return unavailableProductIds.includes(productId);
        }
      ).map(item => ({
        product: item.product._id || item.product,
        quantity: item.quantity
      }));
      
      // Limpiar carrito y agregar solo los no disponibles
      await CartRepository.clearCart(userId);
      for (const item of remainingProducts) {
        try {
          await CartRepository.addProduct(userId, item.product, item.quantity);
        } catch (error) {
          // Si no se puede agregar (ej: stock insuficiente), simplemente continuar
          console.error('Error al agregar producto no disponible de vuelta al carrito:', error);
        }
      }
    } else {
      // Si todo fue exitoso, limpiar completamente el carrito
      await CartRepository.clearCart(userId);
    }

    const ticketDTO = TicketDTO.fromTicket(result.ticket);

    res.json({
      ticket: ticketDTO,
      unavailableProducts: result.unavailableProducts,
      message: result.unavailableProducts.length > 0
        ? 'Compra parcialmente completada. Algunos productos no estaban disponibles.'
        : 'Compra completada exitosamente'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getTickets(req, res) {
  try {
    const userEmail = req.user.email;
    const tickets = await TicketRepository.findByPurchaser(userEmail);
    const ticketsDTO = TicketDTO.fromTickets(tickets);
    
    res.json({ tickets: ticketsDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTicketById(req, res) {
  try {
    const ticket = await TicketRepository.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Verificar que el ticket pertenece al usuario actual (o es admin)
    if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
      return res.status(403).json({ error: 'No autorizado para ver este ticket' });
    }

    const ticketDTO = TicketDTO.fromTicket(ticket);
    res.json({ ticket: ticketDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

