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

module.exports = {
  validateChatMessage,
  sanitizeInput,
  requestLogger,
  formatError,
};
