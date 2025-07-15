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
