// userModel.js - Model for user operations
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
  async createUser(username, email, password_hash) {
    try {
      if (!username || !email || !password_hash)
        throw new Error("Username, email, and password are required");
      const result = await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
        [username, email, password_hash]
      );
      return result.rows[0];
    } catch (error) {
      handleDbError("createUser", error);
    }
  },

  async getUserById(id) {
    try {
      if (!id) throw new Error("User ID is required");
      const result = await pool.query(
        "SELECT id, username, email, created_at FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("getUserById", error);
    }
  },

  async getUserByEmail(email) {
    try {
      if (!email) throw new Error("Email is required");
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("getUserByEmail", error);
    }
  },

  async getUserByUsername(username) {
    try {
      if (!username) throw new Error("Username is required");
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("getUserByUsername", error);
    }
  },

  async getAllUsers(limit = 100, offset = 0) {
    try {
      const result = await pool.query(
        "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      handleDbError("getAllUsers", error);
    }
  },

  async updateUser(id, fields) {
    try {
      if (!id) throw new Error("User ID is required");
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      fields.updated_at = new Date();
      const updatedKeys = Object.keys(fields);
      const setClause = updatedKeys
        .map((k, i) => `${k} = $${i + 2}`)
        .join(", ");
      const values = [id, ...updatedKeys.map((k) => fields[k])];
      const result = await pool.query(
        `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, username, email, created_at, updated_at`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("updateUser", error);
    }
  },

  async deleteUser(id) {
    try {
      if (!id) throw new Error("User ID is required");
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      handleDbError("deleteUser", error);
    }
  },

  async getUsersCount() {
    try {
      const result = await pool.query("SELECT COUNT(*) as count FROM users");
      return parseInt(result.rows[0].count);
    } catch (error) {
      handleDbError("getUsersCount", error);
    }
  },
};
