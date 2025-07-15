// productController.js - Controller for product operations
const productModel = require("../models/productModel");

module.exports = {
  async createProduct(req, res) {
    try {
      const { name, price, category, description } = req.body;
      const product = await productModel.createProduct(
        name,
        price,
        category,
        description
      );
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllProducts(req, res) {
    try {
      const { limit, offset, category } = req.query;
      const products = await productModel.getAllProducts(
        Number(limit) || 100,
        Number(offset) || 0,
        category || null
      );
      res.json(products);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const { limit, offset } = req.query;
      const products = await productModel.getProductsByCategory(
        category,
        Number(limit) || 50,
        Number(offset) || 0
      );
      res.json(products);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async searchProducts(req, res) {
    try {
      const { searchTerm, limit, offset } = req.query;
      const products = await productModel.searchProducts(
        searchTerm,
        Number(limit) || 50,
        Number(offset) || 0
      );
      res.json(products);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.updateProduct(id, req.body);
      if (!product)
        return res
          .status(404)
          .json({ error: "Product not found or no fields to update" });
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deleted = await productModel.deleteProduct(id);
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getProductsCount(req, res) {
    try {
      const { category } = req.query;
      const count = await productModel.getProductsCount(category || null);
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
