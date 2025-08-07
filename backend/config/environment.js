// environment.js
// Environment configuration management

require('dotenv').config();

const environment = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    
    // API Keys
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    
    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    
    // Email
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    
    // Redis
    REDIS_URL: process.env.REDIS_URL,
    
    // File Upload
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads'
  },
  
  isDevelopment: () => environment.env.NODE_ENV === 'development',
  isProduction: () => environment.env.NODE_ENV === 'production',
  isTest: () => environment.env.NODE_ENV === 'test'
};

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !environment.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = environment;