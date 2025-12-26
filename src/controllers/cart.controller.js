import { CartRepository } from '../repositories/cart.repository.js';

export async function getCart(req, res) {
  try {
    const userId = req.user._id;
    const cart = await CartRepository.findByUserId(userId);
    
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addProductToCart(req, res) {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId es requerido' });
    }

    const cart = await CartRepository.addProduct(userId, productId, quantity);
    
    res.json({ cart, message: 'Producto agregado al carrito' });
  } catch (error) {
    if (error.message === 'Stock insuficiente' || error.message === 'Producto no encontrado') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function updateProductQuantity(req, res) {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'quantity debe ser un número positivo' });
    }

    const cart = await CartRepository.updateProductQuantity(userId, productId, quantity);
    
    res.json({ cart, message: 'Cantidad actualizada' });
  } catch (error) {
    if (error.message === 'Stock insuficiente' || error.message === 'Producto no encontrado en el carrito') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function removeProductFromCart(req, res) {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await CartRepository.removeProduct(userId, productId);
    
    res.json({ cart, message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function clearCart(req, res) {
  try {
    const userId = req.user._id;
    const cart = await CartRepository.clearCart(userId);
    
    res.json({ cart, message: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

