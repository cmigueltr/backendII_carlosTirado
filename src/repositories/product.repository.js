import { ProductDAO } from '../dao/product.dao.js';

export class ProductRepository {
  static async findById(id) {
    return await ProductDAO.findById(id);
  }

  static async findAll(query = {}) {
    return await ProductDAO.findAll(query);
  }

  static async findByCode(code) {
    return await ProductDAO.findByCode(code);
  }

  static async create(productData) {
    // Lógica de negocio: validar que el código no exista
    const existingProduct = await ProductDAO.findByCode(productData.code);
    if (existingProduct) {
      throw new Error('El código de producto ya existe');
    }
    return await ProductDAO.create(productData);
  }

  static async updateById(id, updateData) {
    // Lógica de negocio: si se actualiza el código, validar que no exista
    if (updateData.code) {
      const existingProduct = await ProductDAO.findByCode(updateData.code);
      if (existingProduct && existingProduct._id.toString() !== id.toString()) {
        throw new Error('El código de producto ya existe');
      }
    }
    return await ProductDAO.updateById(id, updateData);
  }

  static async deleteById(id) {
    return await ProductDAO.deleteById(id);
  }

  static async updateStock(productId, quantity) {
    // Lógica de negocio: verificar stock antes de actualizar
    const product = await ProductDAO.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    if (product.stock < quantity) {
      throw new Error('Stock insuficiente');
    }
    return await ProductDAO.updateStock(productId, quantity);
  }

  static async checkStock(productId, quantity) {
    const product = await ProductDAO.findById(productId);
    if (!product) {
      return { available: false, message: 'Producto no encontrado' };
    }
    if (product.stock < quantity) {
      return { available: false, message: 'Stock insuficiente', stock: product.stock };
    }
    return { available: true, product };
  }
}

