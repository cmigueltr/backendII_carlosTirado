import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { requireAdmin, authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/products - Público (cualquiera puede ver productos)
router.get('/', getProducts);

// GET /api/products/:id - Público
router.get('/:id', getProductById);

// POST /api/products - Solo admin
router.post('/', requireAdmin, createProduct);

// PUT /api/products/:id - Solo admin
router.put('/:id', requireAdmin, updateProduct);

// DELETE /api/products/:id - Solo admin
router.delete('/:id', requireAdmin, deleteProduct);

export default router;




