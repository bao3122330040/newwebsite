// dbService.js - Enhanced CRUD operations with connection pooling, error handling, and transactions
const pool = require("../database");

// Database connection health check
exports.checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return { status: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database connection error:', error);
    return { status: 'disconnected', error: error.message };
  }
};

// Transaction wrapper for complex operations
exports.withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Enhanced error handling wrapper
const handleDbError = (operation, error) => {
  console.error(`Database operation failed - ${operation}:`, error);
  
  // Check for common PostgreSQL errors
  if (error.code === '23505') {
    throw new Error('Duplicate entry - record already exists');
  } else if (error.code === '23503') {
    throw new Error('Foreign key constraint violation');
  } else if (error.code === '23502') {
    throw new Error('Required field is missing');
  } else if (error.code === '42P01') {
    throw new Error('Table does not exist');
  }
  
  throw new Error(`Database operation failed: ${error.message}`);
};

// USERS - Enhanced with error handling and validation
exports.createUser = async (username, email, password_hash) => {
  try {
    if (!username || !email || !password_hash) {
      throw new Error('Username, email, and password are required');
    }
    
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, password_hash]
    );
    return result.rows[0];
  } catch (error) {
    handleDbError('createUser', error);
  }
};

exports.getUserById = async (id) => {
  try {
    if (!id) throw new Error('User ID is required');
    
    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('getUserById', error);
  }
};

exports.getUserByEmail = async (email) => {
  try {
    if (!email) throw new Error('Email is required');
    
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('getUserByEmail', error);
  }
};

exports.getUserByUsername = async (username) => {
  try {
    if (!username) throw new Error('Username is required');
    
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('getUserByUsername', error);
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
    handleDbError('getAllUsers', error);
  }
};

exports.updateUser = async (id, fields) => {
  try {
    if (!id) throw new Error('User ID is required');
    
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;
    
    // Add updated_at timestamp
    fields.updated_at = new Date();
    const updatedKeys = Object.keys(fields);
    
    const setClause = updatedKeys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...updatedKeys.map((k) => fields[k])];
    
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, username, email, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('updateUser', error);
  }
};

exports.deleteUser = async (id) => {
  try {
    if (!id) throw new Error('User ID is required');
    
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  } catch (error) {
    handleDbError('deleteUser', error);
  }
};

exports.getUsersCount = async () => {
  try {
    const result = await pool.query("SELECT COUNT(*) as count FROM users");
    return parseInt(result.rows[0].count);
  } catch (error) {
    handleDbError('getUsersCount', error);
  }
};

// PRODUCTS - Enhanced with error handling and validation
exports.createProduct = async (name, price, category, description) => {
  try {
    if (!name || price === undefined || price === null) {
      throw new Error('Product name and price are required');
    }
    
    if (price < 0) {
      throw new Error('Product price cannot be negative');
    }
    
    const result = await pool.query(
      "INSERT INTO products (name, price, category, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, category, description]
    );
    return result.rows[0];
  } catch (error) {
    handleDbError('createProduct', error);
  }
};

exports.getAllProducts = async (limit = 100, offset = 0, category = null) => {
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
    handleDbError('getAllProducts', error);
  }
};

exports.getProductById = async (id) => {
  try {
    if (!id) throw new Error('Product ID is required');
    
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('getProductById', error);
  }
};

exports.getProductsByCategory = async (category, limit = 50, offset = 0) => {
  try {
    if (!category) throw new Error('Category is required');
    
    const result = await pool.query(
      "SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [category, limit, offset]
    );
    return result.rows;
  } catch (error) {
    handleDbError('getProductsByCategory', error);
  }
};

exports.searchProducts = async (searchTerm, limit = 50, offset = 0) => {
  try {
    if (!searchTerm) throw new Error('Search term is required');
    
    const result = await pool.query(
      "SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [`%${searchTerm}%`, limit, offset]
    );
    return result.rows;
  } catch (error) {
    handleDbError('searchProducts', error);
  }
};

exports.updateProduct = async (id, fields) => {
  try {
    if (!id) throw new Error('Product ID is required');
    
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;
    
    // Validate price if being updated
    if (fields.price !== undefined && fields.price < 0) {
      throw new Error('Product price cannot be negative');
    }
    
    // Add updated_at timestamp
    fields.updated_at = new Date();
    const updatedKeys = Object.keys(fields);
    
    const setClause = updatedKeys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...updatedKeys.map((k) => fields[k])];
    
    const result = await pool.query(
      `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('updateProduct', error);
  }
};

exports.deleteProduct = async (id) => {
  try {
    if (!id) throw new Error('Product ID is required');
    
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  } catch (error) {
    handleDbError('deleteProduct', error);
  }
};

exports.getProductsCount = async (category = null) => {
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
    handleDbError('getProductsCount', error);
  }
};

// CHAT SESSIONS - Enhanced with error handling and validation
exports.createChatSession = async (user_id) => {
  try {
    if (!user_id) throw new Error('User ID is required');
    
    // Verify user exists
    const userExists = await pool.query("SELECT id FROM users WHERE id = $1", [user_id]);
    if (userExists.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const result = await pool.query(
      "INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING *",
      [user_id]
    );
    return result.rows[0];
  } catch (error) {
    handleDbError('createChatSession', error);
  }
};

exports.getChatSessionById = async (id) => {
  try {
    if (!id) throw new Error('Session ID is required');
    
    const result = await pool.query(
      `SELECT cs.*, u.username, u.email
       FROM chat_sessions cs
       LEFT JOIN users u ON cs.user_id = u.id
       WHERE cs.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('getChatSessionById', error);
  }
};

exports.getChatSessionsByUser = async (user_id, limit = 50, offset = 0) => {
  try {
    if (!user_id) throw new Error('User ID is required');
    
    const result = await pool.query(
      "SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2 OFFSET $3",
      [user_id, limit, offset]
    );
    return result.rows;
  } catch (error) {
    handleDbError('getChatSessionsByUser', error);
  }
};

exports.getAllChatSessions = async (limit = 100, offset = 0) => {
  try {
    const result = await pool.query(
      `SELECT cs.*, u.username
       FROM chat_sessions cs
       LEFT JOIN users u ON cs.user_id = u.id
       ORDER BY cs.started_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  } catch (error) {
    handleDbError('getAllChatSessions', error);
  }
};

exports.updateChatSession = async (id, fields) => {
  try {
    if (!id) throw new Error('Session ID is required');
    
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
    handleDbError('updateChatSession', error);
  }
};

exports.deleteChatSession = async (id) => {
  try {
    if (!id) throw new Error('Session ID is required');
    
    // This will cascade delete all messages due to ON DELETE CASCADE
    const result = await pool.query("DELETE FROM chat_sessions WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  } catch (error) {
    handleDbError('deleteChatSession', error);
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
exports.createChatMessage = async (session_id, user_id, message, is_bot = false) => {
  try {
    if (!session_id || !message) {
      throw new Error('Session ID and message are required');
    }
    
    if (message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }
    
    // Verify session exists
    const sessionExists = await pool.query("SELECT id FROM chat_sessions WHERE id = $1", [session_id]);
    if (sessionExists.rows.length === 0) {
      throw new Error('Chat session not found');
    }
    
    // For user messages, verify user exists
    if (!is_bot && user_id) {
      const userExists = await pool.query("SELECT id FROM users WHERE id = $1", [user_id]);
      if (userExists.rows.length === 0) {
        throw new Error('User not found');
      }
    }
    
    const result = await pool.query(
      "INSERT INTO chat_messages (session_id, user_id, message, is_bot) VALUES ($1, $2, $3, $4) RETURNING *",
      [session_id, user_id, message, is_bot]
    );
    return result.rows[0];
  } catch (error) {
    handleDbError('createChatMessage', error);
  }
};

exports.getMessagesBySession = async (session_id, limit = 100, offset = 0) => {
  try {
    if (!session_id) throw new Error('Session ID is required');
    
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
    handleDbError('getMessagesBySession', error);
  }
};

exports.getMessageById = async (id) => {
  try {
    if (!id) throw new Error('Message ID is required');
    
    const result = await pool.query(
      `SELECT cm.*, u.username 
       FROM chat_messages cm 
       LEFT JOIN users u ON cm.user_id = u.id 
       WHERE cm.id = $1`, 
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    handleDbError('getMessageById', error);
  }
};

exports.updateChatMessage = async (id, fields) => {
  try {
    if (!id) throw new Error('Message ID is required');
    
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
    handleDbError('updateChatMessage', error);
  }
};

exports.deleteChatMessage = async (id) => {
  try {
    if (!id) throw new Error('Message ID is required');
    
    const result = await pool.query("DELETE FROM chat_messages WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  } catch (error) {
    handleDbError('deleteChatMessage', error);
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
    handleDbError('getMessagesCount', error);
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
      message: messageResult.rows[0]
    };
  });
};
