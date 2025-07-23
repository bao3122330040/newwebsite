const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load environment configuration first, before importing any other modules
const environment = require("./config/environment");

// Only proceed if the API key is available
if (!environment.env.GOOGLE_API_KEY) {
  console.error("\n🚫 Cannot start server: Missing GOOGLE_API_KEY");
  process.exit(1);
}

// Import middleware
const {
  logger,
  requestLogger,
  errorHandler,
  notFoundHandler,
  rateLimitHandler,
  gracefulShutdown,
} = require("./middleware/errorHandler");
const { formatError } = require("./middleware/validation");
const config = require("./config/config");

// Import routes
const chatbotRoutes = require("./routes/chatbot");
const agentRoutes = require("./routes/agent");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");

// Import services for health check
const dbService = require("./services/dbService");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: true,
    message: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: true,
    message: "Too many authentication attempts, please try again later.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  handler: rateLimitHandler,
});

// Apply rate limiting
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// CORS configuration
app.use(
  cors(
    config.security
      ? config.security.cors
      : {
          origin:
            process.env.NODE_ENV === "production"
              ? process.env.ALLOWED_ORIGINS?.split(",") || [
                  "http://localhost:3000",
                ]
              : true,
          credentials: true,
        }
  )
);

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use("/api/payment/webhook", express.raw({ type: "application/json" })); // Raw body for Stripe webhooks
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await dbService.checkConnection();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: require("./package.json").version,
      services: {
        database: dbHealth.status === "connected" ? "healthy" : "unhealthy",
        server: "healthy",
      },
    });
  } catch (error) {
    logger.error("Health check failed", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/agent", agentRoutes);

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "GameZone API",
    version: require("./package.json").version,
    description: "Gaming e-commerce platform with AI chatbot integration",
    endpoints: {
      auth: {
        "POST /api/auth/register": "User registration",
        "POST /api/auth/login": "User login",
        "POST /api/auth/logout": "User logout",
        "GET /api/auth/profile": "Get user profile (protected)",
        "PUT /api/auth/profile": "Update user profile (protected)",
        "GET /api/auth/verify": "Verify token validity",
      },
      payment: {
        "POST /api/payment/create-intent": "Create payment intent",
        "POST /api/payment/confirm": "Confirm payment",
        "GET /api/payment/status/:id": "Check payment status",
        "POST /api/payment/cancel/:id": "Cancel payment",
        "POST /api/payment/refund": "Refund payment",
        "POST /api/payment/webhook": "Handle payment webhooks",
      },
      chatbot: "AI chatbot endpoints",
      agent: "AI agent endpoints",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 GameZone server started successfully`);
  logger.info(`📡 Server running on http://localhost:${PORT}`);
  logger.info(`📁 Serving files from: ${__dirname}`);
  logger.info(`🛡️  Security: Helmet enabled, Rate limiting active`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

  // Test database connection on startup
  dbService
    .checkConnection()
    .then((result) => {
      if (result.status === "connected") {
        logger.info("✅ Database connection verified");
      } else {
        logger.error("❌ Database connection failed", null, result);
      }
    })
    .catch((error) => {
      logger.error("❌ Database connection test failed", error);
    });
});

// Graceful shutdown
gracefulShutdown(server);

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", reason, { promise });
  process.exit(1);
});

module.exports = app;
