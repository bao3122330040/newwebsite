// Environment configuration
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), ".env");
let envLoaded = false;

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error("⚠️ Error loading .env file:", result.error);
  } else {
    envLoaded = true;
    console.log("✅ Environment variables loaded from:", envPath);
  }
}

// Verify critical environment variables
const requiredEnvVars = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  MODEL_NAME: process.env.MODEL_NAME || "gemini-2.5-flash",
  MAX_TOKENS: process.env.MAX_TOKENS || "8192",
  TEMPERATURE: process.env.TEMPERATURE || "0.7",
};

// Log environment status for debugging
console.log("\n📊 Environment Configuration:");
console.log(
  `🔑 GOOGLE_API_KEY: ${
    requiredEnvVars.GOOGLE_API_KEY ? "Set ✓" : "Missing ⚠️"
  }`
);
console.log(`🌐 MODEL_NAME: ${requiredEnvVars.MODEL_NAME}`);
console.log(`🔢 MAX_TOKENS: ${requiredEnvVars.MAX_TOKENS}`);
console.log(`🌡️ TEMPERATURE: ${requiredEnvVars.TEMPERATURE}`);
console.log(`🖥️ PORT: ${requiredEnvVars.PORT}`);
console.log(`🛠️ NODE_ENV: ${requiredEnvVars.NODE_ENV}\n`);

// Verify critical variables are set
if (!requiredEnvVars.GOOGLE_API_KEY) {
  console.error(
    "⛔ CRITICAL ERROR: GOOGLE_API_KEY not found in environment variables"
  );
  console.error("Please make sure your .env file contains a valid API key");
}

module.exports = {
  env: requiredEnvVars,
  isLoaded: envLoaded,
};
