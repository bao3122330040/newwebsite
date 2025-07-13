// chatController.js - Controller for chat sessions and messages
const chatModel = require("../models/chatModel");

module.exports = {
  async createSession(req, res) {
    try {
      const { user_id } = req.body;
      const session = await chatModel.createChatSession(user_id);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const session = await chatModel.getChatSessionById(id);
      if (!session) return res.status(404).json({ error: "Session not found" });
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getSessionsByUser(req, res) {
    try {
      const { user_id } = req.params;
      const { limit, offset } = req.query;
      const sessions = await chatModel.getChatSessionsByUser(
        user_id,
        Number(limit) || 50,
        Number(offset) || 0
      );
      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllSessions(req, res) {
    try {
      const { limit, offset } = req.query;
      const sessions = await chatModel.getAllChatSessions(
        Number(limit) || 100,
        Number(offset) || 0
      );
      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateSession(req, res) {
    try {
      const { id } = req.params;
      const session = await chatModel.updateChatSession(id, req.body);
      if (!session)
        return res
          .status(404)
          .json({ error: "Session not found or no fields to update" });
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteSession(req, res) {
    try {
      const { id } = req.params;
      const deleted = await chatModel.deleteChatSession(id);
      if (!deleted) return res.status(404).json({ error: "Session not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async createMessage(req, res) {
    try {
      const { session_id, user_id, message, is_bot } = req.body;
      const msg = await chatModel.createChatMessage(
        session_id,
        user_id,
        message,
        is_bot
      );
      res.status(201).json(msg);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getMessagesBySession(req, res) {
    try {
      const { session_id } = req.params;
      const { limit, offset } = req.query;
      const messages = await chatModel.getMessagesBySession(
        session_id,
        Number(limit) || 100,
        Number(offset) || 0
      );
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getMessageById(req, res) {
    try {
      const { id } = req.params;
      const msg = await chatModel.getMessageById(id);
      if (!msg) return res.status(404).json({ error: "Message not found" });
      res.json(msg);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateMessage(req, res) {
    try {
      const { id } = req.params;
      const msg = await chatModel.updateChatMessage(id, req.body);
      if (!msg)
        return res
          .status(404)
          .json({ error: "Message not found or no fields to update" });
      res.json(msg);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const deleted = await chatModel.deleteChatMessage(id);
      if (!deleted) return res.status(404).json({ error: "Message not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getMessagesCount(req, res) {
    try {
      const { session_id } = req.query;
      const count = await chatModel.getMessagesCount(session_id);
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async createSessionWithFirstMessage(req, res) {
    try {
      const { user_id, message } = req.body;
      const result = await chatModel.createChatSessionWithFirstMessage(
        user_id,
        message
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
