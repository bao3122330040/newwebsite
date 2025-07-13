// chatModel.js - Model for chat sessions and messages
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
  async createChatSession(user_id) {
    try {
      if (!user_id) throw new Error("User ID is required");
      const userExists = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [user_id]
      );
      if (userExists.rows.length === 0) throw new Error("User not found");
      const result = await pool.query(
        "INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING *",
        [user_id]
      );
      return result.rows[0];
    } catch (error) {
      handleDbError("createChatSession", error);
    }
  },

  async getChatSessionById(id) {
    try {
      if (!id) throw new Error("Session ID is required");
      const result = await pool.query(
        `SELECT cs.*, u.username, u.email FROM chat_sessions cs LEFT JOIN users u ON cs.user_id = u.id WHERE cs.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("getChatSessionById", error);
    }
  },

  async getChatSessionsByUser(user_id, limit = 50, offset = 0) {
    try {
      if (!user_id) throw new Error("User ID is required");
      const result = await pool.query(
        "SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2 OFFSET $3",
        [user_id, limit, offset]
      );
      return result.rows;
    } catch (error) {
      handleDbError("getChatSessionsByUser", error);
    }
  },

  async getAllChatSessions(limit = 100, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT cs.*, u.username FROM chat_sessions cs LEFT JOIN users u ON cs.user_id = u.id ORDER BY cs.started_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      handleDbError("getAllChatSessions", error);
    }
  },

  async updateChatSession(id, fields) {
    try {
      if (!id) throw new Error("Session ID is required");
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const values = [id, ...keys.map((k) => fields[k])];
      const result = await pool.query(
        `UPDATE chat_sessions SET ${setClause} WHERE id = $1 RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("updateChatSession", error);
    }
  },

  async deleteChatSession(id) {
    try {
      if (!id) throw new Error("Session ID is required");
      const result = await pool.query(
        "DELETE FROM chat_sessions WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      handleDbError("deleteChatSession", error);
    }
  },

  async createChatMessage(session_id, user_id, message, is_bot = false) {
    try {
      if (!session_id || !message)
        throw new Error("Session ID and message are required");
      if (message.trim().length === 0)
        throw new Error("Message cannot be empty");
      const sessionExists = await pool.query(
        "SELECT id FROM chat_sessions WHERE id = $1",
        [session_id]
      );
      if (sessionExists.rows.length === 0)
        throw new Error("Chat session not found");
      if (!is_bot && user_id) {
        const userExists = await pool.query(
          "SELECT id FROM users WHERE id = $1",
          [user_id]
        );
        if (userExists.rows.length === 0) throw new Error("User not found");
      }
      const result = await pool.query(
        "INSERT INTO chat_messages (session_id, user_id, message, is_bot) VALUES ($1, $2, $3, $4) RETURNING *",
        [session_id, user_id, message, is_bot]
      );
      return result.rows[0];
    } catch (error) {
      handleDbError("createChatMessage", error);
    }
  },

  async getMessagesBySession(session_id, limit = 100, offset = 0) {
    try {
      if (!session_id) throw new Error("Session ID is required");
      const result = await pool.query(
        `SELECT cm.*, u.username FROM chat_messages cm LEFT JOIN users u ON cm.user_id = u.id WHERE cm.session_id = $1 ORDER BY cm.created_at ASC LIMIT $2 OFFSET $3`,
        [session_id, limit, offset]
      );
      return result.rows;
    } catch (error) {
      handleDbError("getMessagesBySession", error);
    }
  },

  async getMessageById(id) {
    try {
      if (!id) throw new Error("Message ID is required");
      const result = await pool.query(
        `SELECT cm.*, u.username FROM chat_messages cm LEFT JOIN users u ON cm.user_id = u.id WHERE cm.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("getMessageById", error);
    }
  },

  async updateChatMessage(id, fields) {
    try {
      if (!id) throw new Error("Message ID is required");
      const keys = Object.keys(fields);
      if (keys.length === 0) return null;
      fields.updated_at = new Date();
      const updatedKeys = Object.keys(fields);
      const setClause = updatedKeys
        .map((k, i) => `${k} = $${i + 2}`)
        .join(", ");
      const values = [id, ...updatedKeys.map((k) => fields[k])];
      const result = await pool.query(
        `UPDATE chat_messages SET ${setClause} WHERE id = $1 RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      handleDbError("updateChatMessage", error);
    }
  },

  async deleteChatMessage(id) {
    try {
      if (!id) throw new Error("Message ID is required");
      const result = await pool.query(
        "DELETE FROM chat_messages WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      handleDbError("deleteChatMessage", error);
    }
  },

  async getMessagesCount(session_id = null) {
    try {
      let query = "SELECT COUNT(*) as count FROM chat_messages";
      let params = [];
      if (session_id) {
        query += " WHERE session_id = $1";
        params.push(session_id);
      }
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      handleDbError("getMessagesCount", error);
    }
  },

  async createChatSessionWithFirstMessage(user_id, message) {
    const withTransaction = async (callback) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    };
    return await withTransaction(async (client) => {
      const sessionResult = await client.query(
        "INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING *",
        [user_id]
      );
      const session = sessionResult.rows[0];
      const messageResult = await client.query(
        "INSERT INTO chat_messages (session_id, user_id, message, is_bot) VALUES ($1, $2, $3, $4) RETURNING *",
        [session.id, user_id, message, false]
      );
      return { session: session, message: messageResult.rows[0] };
    });
  },
};
