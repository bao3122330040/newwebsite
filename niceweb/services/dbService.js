// dbService.js - Enhanced CRUD operations with connection pooling, error handling, and transactions
const pool = require("../database");

// Database connection health check
exports.checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    return { status: "connected", timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Database connection error:", error);
    return { status: "disconnected", error: error.message };
  }
};

// Transaction wrapper for complex operations
exports.withTransaction = async (callback) => {
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

// Enhanced error handling wrapper
const handleDbError = (operation, error) => {
  console.error(`Database operation failed - ${operation}:`, error);

  // Check for common PostgreSQL errors
  if (error.code === "23505") {
    throw new Error("Duplicate entry - record already exists");
  } else if (error.code === "23503") {
    throw new Error("Foreign key constraint violation");
  } else if (error.code === "23502") {
    throw new Error("Required field is missing");
  } else if (error.code === "42P01") {
    throw new Error("Table does not exist");
  }

  throw new Error(`Database operation failed: ${error.message}`);
};

// USERS - Enhanced with error handling and validation
exports.createUser = async (username, email, password_hash) => {
  try {
    if (!username || !email || !password_hash) {
      throw new Error("Username, email, and password are required");
    }

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, password_hash]
    );
    return result.rows[0];
  } catch (error) {
    handleDbError("createUser", error);
  }
};

exports.getUserById = async (id) => {
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
};

exports.getUserByEmail = async (email) => {
  try {
    if (!email) throw new Error("Email is required");

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  } catch (error) {
    handleDbError("getUserByEmail", error);
  }
};

exports.getUserByUsername = async (username) => {
  try {
    if (!username) throw new Error("Username is required");

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0] || null;
  } catch (error) {
    handleDbError("getUserByUsername", error);
  }
};

exports.getAllUsers = async (limit = 100, offset = 0) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  } catch (error) {
    handleDbError("getAllUsers", error);
  }
};

exports.deleteChatSession = async (id) => {
  try {
    if (!id) throw new Error("Session ID is required");

    // This will cascade delete all messages due to ON DELETE CASCADE
    const result = await pool.query(
      "DELETE FROM chat_sessions WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows.length > 0;
  } catch (error) {
    handleDbError("deleteChatSession", error);
  }
};

// CHAT MESSAGES
exports.createChatMessage = async (session_id, user_id, message, is_bot) => {
  const result = await pool.query(
    "INSERT INTO chat_messages (session_id, user_id, message, is_bot) VALUES ($1, $2, $3, $4) RETURNING *",
    [session_id, user_id, message, is_bot]
  );
  return result.rows[0];
};
exports.getMessagesBySession = async (session_id) => {
  const result = await pool.query(
    "SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC",
    [session_id]
  );
  return result.rows;
};
exports.getMessageById = async (id) => {
  const result = await pool.query("SELECT * FROM chat_messages WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
};
exports.updateChatMessage = async (id, fields) => {
  // fields: {message, is_bot}
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = [id, ...keys.map((k) => fields[k])];
  const result = await pool.query(
    `UPDATE chat_messages SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};
exports.deleteChatMessage = async (id) => {
  await pool.query("DELETE FROM chat_messages WHERE id = $1", [id]);
  return true;
};

// CHAT MESSAGES - Enhanced with error handling and validation
exports.createChatMessage = async (
  session_id,
  user_id,
  message,
  is_bot = false
) => {
  try {
    if (!session_id || !message) {
      throw new Error("Session ID and message are required");
    }

    if (message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    // Verify session exists
    const sessionExists = await pool.query(
      "SELECT id FROM chat_sessions WHERE id = $1",
      [session_id]
    );
    if (sessionExists.rows.length === 0) {
      throw new Error("Chat session not found");
    }

    // For user messages, verify user exists
    if (!is_bot && user_id) {
      const userExists = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [user_id]
      );
      if (userExists.rows.length === 0) {
        throw new Error("User not found");
      }
    }

    const result = await pool.query(
      "INSERT INTO chat_messages (session_id, user_id, message, is_bot) VALUES ($1, $2, $3, $4) RETURNING *",
      [session_id, user_id, message, is_bot]
    );
    return result.rows[0];
  } catch (error) {
    handleDbError("createChatMessage", error);
  }
};

exports.getMessagesBySession = async (session_id, limit = 100, offset = 0) => {
  try {
    if (!session_id) throw new Error("Session ID is required");

    const result = await pool.query(
      `SELECT cm.*, u.username 
       FROM chat_messages cm 
       LEFT JOIN users u ON cm.user_id = u.id 
       WHERE cm.session_id = $1 
       ORDER BY cm.created_at ASC 
       LIMIT $2 OFFSET $3`,
      [session_id, limit, offset]
    );
    return result.rows;
  } catch (error) {
    handleDbError("getMessagesBySession", error);
  }
};

exports.getMessageById = async (id) => {
  try {
    if (!id) throw new Error("Message ID is required");

    const result = await pool.query(
      `SELECT cm.*, u.username 
       FROM chat_messages cm 
       LEFT JOIN users u ON cm.user_id = u.id 
       WHERE cm.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError("getMessageById", error);
  }
};

exports.updateChatMessage = async (id, fields) => {
  try {
    if (!id) throw new Error("Message ID is required");

    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    // Add updated_at timestamp
    fields.updated_at = new Date();
    const updatedKeys = Object.keys(fields);

    const setClause = updatedKeys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...updatedKeys.map((k) => fields[k])];

    const result = await pool.query(
      `UPDATE chat_messages SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError("updateChatMessage", error);
  }
};

exports.deleteChatMessage = async (id) => {
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
};

exports.getMessagesCount = async (session_id = null) => {
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
};

// Bulk operations for complex transactions
exports.createChatSessionWithFirstMessage = async (user_id, message) => {
  return await exports.withTransaction(async (client) => {
    // Create session
    const sessionResult = await client.query(
      "INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING *",
      [user_id]
    );
    const session = sessionResult.rows[0];

    // Create first message
    const messageResult = await client.query(
      "INSERT INTO chat_messages (session_id, user_id, message, is_bot) VALUES ($1, $2, $3, $4) RETURNING *",
      [session.id, user_id, message, false]
    );

    return {
      session: session,
      message: messageResult.rows[0],
    };
  });
};
