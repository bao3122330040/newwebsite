// User Authentication Service (JWT + bcrypt)
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

module.exports = {
  hashPassword: (password) => bcrypt.hash(password, 10),
  comparePassword: (password, hash) => bcrypt.compare(password, hash),
  signToken: (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }),
  verifyToken: (token) => jwt.verify(token, JWT_SECRET),
};
