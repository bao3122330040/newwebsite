// productModel.js
// Model for product data structure

class Product {
  constructor(id, name, price, description, imageUrl) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }
}

module.exports = Product;
