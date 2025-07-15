// userController.js - Controller for user operations
const userModel = require("../models/userModel");

module.exports = {
  async createUser(req, res) {
    try {
      const { username, email, password_hash } = req.body;
      const user = await userModel.createUser(username, email, password_hash);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.getUserById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUserByEmail(req, res) {
    try {
      const { email } = req.query;
      const user = await userModel.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUserByUsername(req, res) {
    try {
      const { username } = req.query;
      const user = await userModel.getUserByUsername(username);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllUsers(req, res) {
    try {
      const { limit, offset } = req.query;
      const users = await userModel.getAllUsers(
        Number(limit) || 100,
        Number(offset) || 0
      );
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.updateUser(id, req.body);
      if (!user)
        return res
          .status(404)
          .json({ error: "User not found or no fields to update" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await userModel.deleteUser(id);
      if (!deleted) return res.status(404).json({ error: "User not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUsersCount(req, res) {
    try {
      const count = await userModel.getUsersCount();
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
