// dbService.js - CRUD cho users, products, chat_sessions, chat_messages
const pool = require("../database");

// USERS
exports.createUser = async (username, email, password_hash) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [username, email, password_hash]
  );
  return result.rows[0];
};
exports.getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};
exports.getUserByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
};
exports.getAllUsers = async () => {
  const result = await pool.query(
    "SELECT * FROM users ORDER BY created_at DESC"
  );
  return result.rows;
};
exports.updateUser = async (id, fields) => {
  // fields: {username, email, password_hash}
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = [id, ...keys.map((k) => fields[k])];
  const result = await pool.query(
    `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};
exports.deleteUser = async (id) => {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return true;
};

// PRODUCTS
exports.createProduct = async (name, price, category, description) => {
  const result = await pool.query(
    "INSERT INTO products (name, price, category, description) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, price, category, description]
  );
  return result.rows[0];
};
exports.getAllProducts = async () => {
  const result = await pool.query(
    "SELECT * FROM products ORDER BY created_at DESC"
  );
  return result.rows;
};
exports.getProductById = async (id) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
};
exports.updateProduct = async (id, fields) => {
  // fields: {name, price, category, description}
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = [id, ...keys.map((k) => fields[k])];
  const result = await pool.query(
    `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};
exports.deleteProduct = async (id) => {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return true;
};

// CHAT SESSIONS
exports.createChatSession = async (user_id) => {
  const result = await pool.query(
    "INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING *",
    [user_id]
  );
  return result.rows[0];
};
exports.getChatSessionById = async (id) => {
  const result = await pool.query("SELECT * FROM chat_sessions WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
};
exports.getAllChatSessions = async () => {
  const result = await pool.query(
    "SELECT * FROM chat_sessions ORDER BY started_at DESC"
  );
  return result.rows;
};
exports.deleteChatSession = async (id) => {
  await pool.query("DELETE FROM chat_sessions WHERE id = $1", [id]);
  return true;
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
