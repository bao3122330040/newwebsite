// config.js
// Main application configuration

const environment = require('./environment');

const config = {
  // Server configuration
  server: {
    port: environment.env.PORT,
    host: '0.0.0.0',
    timeout: 30000, // 30 seconds
    keepAliveTimeout: 5000
  },

  // Security configuration
  security: {
    cors: {
      origin: environment.isProduction() 
        ? environment.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
      message: {
        error: true,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    },
    
    authRateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // auth requests per window
      message: {
        error: true,
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
      }
    },
    
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }
  },

  // Database configuration
  database: {
    mongodb: {
      uri: environment.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    
    redis: {
      url: environment.env.REDIS_URL,
      options: {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      }
    }
  },

  // JWT configuration
  jwt: {
    secret: environment.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    algorithm: 'HS256'
  },

  // API configuration
  api: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000,
    maxRequestSize: environment.env.MAX_FILE_SIZE
  },

  // External services
  services: {
    google: {
      apiKey: environment.env.GOOGLE_API_KEY,
      timeout: 10000
    },
    
    stripe: {
      secretKey: environment.env.STRIPE_SECRET_KEY,
      webhookSecret: environment.env.STRIPE_WEBHOOK_SECRET,
      apiVersion: '2023-10-16'
    },
    
    email: {
      host: environment.env.EMAIL_HOST,
      port: environment.env.EMAIL_PORT,
      secure: environment.env.EMAIL_PORT == 465,
      auth: {
        user: environment.env.EMAIL_USER,
        pass: environment.env.EMAIL_PASS
      }
    }
  },

  // File upload configuration
  upload: {
    maxSize: environment.env.MAX_FILE_SIZE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    destination: environment.env.UPLOAD_PATH
  },

  // Logging configuration
  logging: {
    level: environment.isDevelopment() ? 'debug' : 'info',
    format: environment.isDevelopment() ? 'dev' : 'combined',
    file: {
      enabled: environment.isProduction(),
      filename: 'app.log',
      maxSize: '10m',
      maxFiles: '14d'
    }
  },

  // Cache configuration
  cache: {
    ttl: 3600, // 1 hour
    checkPeriod: 600, // 10 minutes
    maxKeys: 1000
  }
};

module.exports = config;