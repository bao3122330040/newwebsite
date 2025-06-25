const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

// Load environment configuration first, before importing any other modules
const environment = require("./config/environment");

// Only proceed if the API key is available
if (!environment.env.GOOGLE_API_KEY) {
  console.error("\n🚫 Cannot start server: Missing GOOGLE_API_KEY");
  process.exit(1);
}

const { requestLogger, formatError } = require("./middleware/validation");
const config = require("./config/config");
const chatbotRoutes = require("./routes/chatbot");
const agentRoutes = require("./routes/agent");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(config.security.cors));
app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/agent", agentRoutes);

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Error handling middleware
app.use(formatError);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
});

module.exports = app;
