export class ProductDTO {
  constructor(product) {
    this.id = product._id || product.id;
    this.title = product.title;
    this.description = product.description;
    this.price = product.price;
    this.thumbnail = product.thumbnail;
    this.code = product.code;
    this.stock = product.stock;
    this.category = product.category;
    this.status = product.status;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }

  static fromProduct(product) {
    if (!product) return null;
    return new ProductDTO(product);
  }

  static fromProducts(products) {
    return products.map(product => ProductDTO.fromProduct(product));
  }
}




