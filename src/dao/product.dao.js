import Product from '../models/product.model.js';

export class ProductDAO {
  static async findById(id) {
    return await Product.findById(id);
  }

  static async findAll(query = {}) {
    return await Product.find(query);
  }

  static async findByCode(code) {
    return await Product.findOne({ code });
  }

  static async create(productData) {
    return await Product.create(productData);
  }

  static async updateById(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  static async updateStock(productId, quantity) {
    return await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }
}




