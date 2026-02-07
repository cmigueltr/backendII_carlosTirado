import { ProductRepository } from '../repositories/product.repository.js';
import { ProductDTO } from '../dto/product.dto.js';

export async function getProducts(req, res) {
  try {
    const { category, status } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status !== undefined) query.status = status === 'true';

    const products = await ProductRepository.findAll(query);
    const productsDTO = ProductDTO.fromProducts(products);
    
    res.json({ products: productsDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await ProductRepository.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const productDTO = ProductDTO.fromProduct(product);
    res.json({ product: productDTO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const productData = req.body;
    
    // Validaciones básicas
    if (!productData.title || !productData.description || !productData.price || !productData.code || !productData.stock || !productData.category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const product = await ProductRepository.create(productData);
    const productDTO = ProductDTO.fromProduct(product);
    
    res.status(201).json({ product: productDTO });
  } catch (error) {
    if (error.message === 'El código de producto ya existe') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await ProductRepository.updateById(req.params.id, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (product.errors) {
      return res.status(400).json({ error: 'Error de validación', details: product.errors });
    }

    const productDTO = ProductDTO.fromProduct(product);
    res.json({ product: productDTO });
  } catch (error) {
    if (error.message === 'El código de producto ya existe') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await ProductRepository.deleteById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}




