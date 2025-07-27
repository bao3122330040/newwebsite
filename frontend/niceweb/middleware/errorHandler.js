const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logger utility
class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...metadata
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, metadata = {}) {
    const logEntry = this.formatMessage('info', message, metadata);
    console.log(`ℹ️  ${message}`, metadata);
    this.writeToFile(this.logFile, logEntry);
  }

  warn(message, metadata = {}) {
    const logEntry = this.formatMessage('warn', message, metadata);
    console.warn(`⚠️  ${message}`, metadata);
    this.writeToFile(this.logFile, logEntry);
  }

  error(message, error = null, metadata = {}) {
    const errorMetadata = {
      ...metadata,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    };
    
    const logEntry = this.formatMessage('error', message, errorMetadata);
    console.error(`❌ ${message}`, error || '', metadata);
    this.writeToFile(this.errorFile, logEntry);
  }

  debug(message, metadata = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const logEntry = this.formatMessage('debug', message, metadata);
      console.debug(`🐛 ${message}`, metadata);
      this.writeToFile(this.logFile, logEntry);
    }
  }
}

const logger = new Logger();

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log request start
  logger.info('Request started', {
    method,
    url,
    ip,
    userAgent,
    timestamp,
    userId: req.user ? req.user.id : null
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log request completion
    logger.info('Request completed', {
      method,
      url,
      ip,
      statusCode,
      duration: `${duration}ms`,
      userId: req.user ? req.user.id : null
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  const error = {
    error: true,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
    path: req.url
  };

  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.url,
    method: req.method
  });

  res.status(429).json(error);
};

// Custom error classes
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = 'VALIDATION_ERROR';
    this.details = details;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.code = 'AUTHENTICATION_ERROR';
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.code = 'AUTHORIZATION_ERROR';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.code = 'CONFLICT';
  }
}

class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.code = 'DATABASE_ERROR';
    this.originalError = originalError;
  }
}

class PaymentError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'PaymentError';
    this.statusCode = 500;
    this.code = 'PAYMENT_ERROR';
    this.originalError = originalError;
  }
}

// Centralized error handling middleware
const errorHandler = (error, req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user ? req.user.id : null;

  // Log the error
  logger.error('Request error occurred', error, {
    method,
    url,
    ip,
    userId,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Determine status code
  let statusCode = error.statusCode || 500;
  
  // Handle specific error types
  if (error.name === 'ValidationError' && !error.statusCode) {
    statusCode = 400;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  } else if (error.code === 11000) { // MongoDB duplicate key
    statusCode = 409;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
  }

  // Prepare error response
  const errorResponse = {
    error: true,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    timestamp,
    path: url
  };

  // Add details for validation errors
  if (error.details) {
    errorResponse.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = error.stack;
  }

  // Handle specific status codes
  if (statusCode >= 500) {
    // Server errors - log as error
    logger.error('Server error', error, { statusCode });
  } else if (statusCode >= 400) {
    // Client errors - log as warning
    logger.warn('Client error', { 
      message: error.message, 
      statusCode, 
      url, 
      method 
    });
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res) => {
  const error = {
    error: true,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json(error);
};

// Async error wrapper for route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Database connection error handler
const handleDatabaseError = (error) => {
  logger.error('Database connection error', error);
  
  if (error.code === 'ECONNREFUSED') {
    throw new DatabaseError('Database connection refused - check if database server is running');
  } else if (error.code === 'ENOTFOUND') {
    throw new DatabaseError('Database host not found - check database configuration');
  } else if (error.code === 'ECONNRESET') {
    throw new DatabaseError('Database connection reset - network issue or server restart');
  } else {
    throw new DatabaseError('Database operation failed', error);
  }
};

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

module.exports = {
  logger,
  requestLogger,
  rateLimitHandler,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleDatabaseError,
  gracefulShutdown,
  // Custom error classes
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  PaymentError
};