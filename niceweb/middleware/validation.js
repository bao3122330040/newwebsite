const config = require("../config/config");

// Validate chat message middleware
const validateChatMessage = (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message is required",
      code: "MISSING_MESSAGE",
    });
  }

  if (typeof message !== "string") {
    return res.status(400).json({
      error: "Message must be a string",
      code: "INVALID_MESSAGE_TYPE",
    });
  }

  if (message.length > config.chat.maxMessageLength) {
    return res.status(400).json({
      error: `Message too long. Maximum length is ${config.chat.maxMessageLength} characters`,
      code: "MESSAGE_TOO_LONG",
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      error: "Message cannot be empty",
      code: "EMPTY_MESSAGE",
    });
  }

  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  if (req.body.message) {
    // Basic sanitization - remove potentially harmful content
    req.body.message = req.body.message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .trim();
  }

  if (req.body.sessionId) {
    // Ensure sessionId is alphanumeric
    req.body.sessionId = req.body.sessionId.replace(/[^a-zA-Z0-9-_]/g, "");
  }

  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  next();
};

// Error response formatter
const formatError = (error, req, res, next) => {
  const timestamp = new Date().toISOString();

  // Log error
  console.error(`[${timestamp}] Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });

  // Send formatted error response
  const statusCode = error.statusCode || 500;
  const response = {
    error: true,
    message: error.message || "Internal server error",
    timestamp: timestamp,
    path: req.url,
  };

  // Don't expose stack trace in production
  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required',
        code: 'MISSING_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    const authService = require('../auth/authService');
    const dbService = require('../services/dbService');
    
    const decoded = authService.verifyToken(token);
    const user = await dbService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token - user not found',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired token',
      code: 'TOKEN_VERIFICATION_FAILED',
      timestamp: new Date().toISOString()
    });
  }
};

// Validation for user registration
const validateRegistration = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check required fields
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      error: true,
      message: 'All fields are required',
      code: 'MISSING_FIELDS',
      timestamp: new Date().toISOString()
    });
  }

  // Validate username
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({
      error: true,
      message: 'Username must be between 3 and 30 characters',
      code: 'INVALID_USERNAME_LENGTH',
      timestamp: new Date().toISOString()
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      error: true,
      message: 'Username can only contain letters, numbers, and underscores',
      code: 'INVALID_USERNAME_FORMAT',
      timestamp: new Date().toISOString()
    });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: true,
      message: 'Please provide a valid email address',
      code: 'INVALID_EMAIL_FORMAT',
      timestamp: new Date().toISOString()
    });
  }

  // Validate password
  if (password.length < 6) {
    return res.status(400).json({
      error: true,
      message: 'Password must be at least 6 characters long',
      code: 'INVALID_PASSWORD_LENGTH',
      timestamp: new Date().toISOString()
    });
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({
      error: true,
      message: 'Passwords do not match',
      code: 'PASSWORD_MISMATCH',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Validation for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'Email and password are required',
      code: 'MISSING_CREDENTIALS',
      timestamp: new Date().toISOString()
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: true,
      message: 'Please provide a valid email address',
      code: 'INVALID_EMAIL_FORMAT',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Validation for payment intent creation
const validatePaymentIntent = (req, res, next) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount) {
    return res.status(400).json({
      error: true,
      message: 'Amount is required',
      code: 'MISSING_AMOUNT',
      timestamp: new Date().toISOString()
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: true,
      message: 'Amount must be a positive number',
      code: 'INVALID_AMOUNT',
      timestamp: new Date().toISOString()
    });
  }

  if (amount > 999999.99) {
    return res.status(400).json({
      error: true,
      message: 'Amount exceeds maximum allowed value',
      code: 'AMOUNT_TOO_LARGE',
      timestamp: new Date().toISOString()
    });
  }

  // Validate currency
  const supportedCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud'];
  if (!supportedCurrencies.includes(currency.toLowerCase())) {
    return res.status(400).json({
      error: true,
      message: 'Unsupported currency',
      code: 'INVALID_CURRENCY',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Validation for product data
const validateProduct = (req, res, next) => {
  const { name, price, category, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      error: true,
      message: 'Product name and price are required',
      code: 'MISSING_PRODUCT_FIELDS',
      timestamp: new Date().toISOString()
    });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      error: true,
      message: 'Price must be a non-negative number',
      code: 'INVALID_PRICE',
      timestamp: new Date().toISOString()
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      error: true,
      message: 'Product name must be 100 characters or less',
      code: 'NAME_TOO_LONG',
      timestamp: new Date().toISOString()
    });
  }

  if (category && category.length > 50) {
    return res.status(400).json({
      error: true,
      message: 'Category must be 50 characters or less',
      code: 'CATEGORY_TOO_LONG',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = {
  validateChatMessage,
  sanitizeInput,
  requestLogger,
  formatError,
  authenticateToken,
  validateRegistration,
  validateLogin,
  validatePaymentIntent,
  validateProduct,
};
