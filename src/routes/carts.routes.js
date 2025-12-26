import { Router } from 'express';
import {
  getCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCart
} from '../controllers/cart.controller.js';
import { requireUser } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación como usuario
router.get('/', requireUser, getCart);
router.post('/products', requireUser, addProductToCart);
router.put('/products/:productId', requireUser, updateProductQuantity);
router.delete('/products/:productId', requireUser, removeProductFromCart);
router.delete('/', requireUser, clearCart);

export default router;

