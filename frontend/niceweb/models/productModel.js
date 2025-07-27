// productModel.js - Model for product operations
const pool = require("../database");

const handleDbError = (operation, error) => {
  console.error(`Database operation failed - ${operation}:`, error);
  if (error.code === "23505")
    throw new Error("Duplicate entry - record already exists");
  if (error.code === "23503")
    throw new Error("Foreign key constraint violation");
  if (error.code === "23502") throw new Error("Required field is missing");
  if (error.code === "42P01") throw new Error("Table does not exist");
  throw new Error(`Database operation failed: ${error.message}`);
};

module.exports = {
  async createProduct(name, price, category, description) {
    try {
      if (!name || price === undefined || price === null)
        throw new Error("Product name and price are required");
      if (price < 0) throw new Error("Product price cannot be negative");
      const result = await pool.query(
        "INSERT INTO products (name, price, category, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, price, category, description]
      );
      return result.rows[0];
    } catch (error) {
      handleDbError("createProduct", error);
    }
  },

  async getAllProducts(limit = 100, offset = 0, category = null) {
    try {
      let query = "SELECT * FROM products";
      let params = [limit, offset];
      if (category) {
        query += " WHERE category = $3";
        params.push(category);
      }
      query += " ORDER BY created_at DESC LIMIT $1 OFFSET $2";
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      handleDbError("getAllProducts", error);
    }
  },

  async getProductById(id) {
    try {
      if (!id) throw new Error("Product ID is required");
      const result = await pool.query("SELECT * FROM products WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("getProductById", error);
    }
  },

  async getProductsByCategory(category, limit = 50, offset = 0) {
    try {
      if (!category) throw new Error("Category is required");
      const result = await pool.query(
        "SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [category, limit, offset]
      );
      return result.rows;
    } catch (error) {
      handleDbError("getProductsByCategory", error);
    }
  },

  async searchProducts(searchTerm, limit = 50, offset = 0) {
    try {
      if (!searchTerm) throw new Error("Search term is required");
      const result = await pool.query(
        "SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [`%${searchTerm}%`, limit, offset]
      );
      return result.rows;
    } catch (error) {
      handleDbError("searchProducts", error);
    }
  },

  async updateProduct(id, fields) {
    try {
      if (!id) throw new Error("Product ID is required");
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      if (fields.price !== undefined && fields.price < 0)
        throw new Error("Product price cannot be negative");
      fields.updated_at = new Date();
      const updatedKeys = Object.keys(fields);
      const setClause = updatedKeys
        .map((k, i) => `${k} = $${i + 2}`)
        .join(", ");
      const values = [id, ...updatedKeys.map((k) => fields[k])];
      const result = await pool.query(
        `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("updateProduct", error);
    }
  },

  async deleteProduct(id) {
    try {
      if (!id) throw new Error("Product ID is required");
      const result = await pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      handleDbError("deleteProduct", error);
    }
  },

  async getProductsCount(category = null) {
    try {
      let query = "SELECT COUNT(*) as count FROM products";
      let params = [];
      if (category) {
        query += " WHERE category = $1";
        params.push(category);
      }
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      handleDbError("getProductsCount", error);
    }
  },
};
