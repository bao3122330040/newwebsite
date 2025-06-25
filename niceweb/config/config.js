module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || "localhost",
  },

  // API configuration
  api: {
    prefix: "/api",
    version: "v1",
    timeout: 30000, // 30 seconds
  },

  // Gemini configuration
  gemini: {
    model: process.env.MODEL_NAME || "gemini-2.5-flash",
    maxTokens: parseInt(process.env.MAX_TOKENS) || 8192,
    temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
    topK: 40,
    topP: 0.95,
  },

  // Chat configuration
  chat: {
    maxHistoryLength: 20,
    maxMessageLength: 1000,
    defaultSessionId: "default",
  },

  // Security configuration
  security: {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? ["https://yourdomain.com"]
          : ["http://localhost:3000", "http://localhost:5000"],
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};
