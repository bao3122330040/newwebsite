// Test script for Gemini API connectivity
const environment = require("./config/environment");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
  try {
    console.log("🧪 Testing Gemini API connection...");

    // Check API key
    if (!environment.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY not found in environment variables");
    }

    console.log("🔑 API Key found");

    // Initialize the API client
    const genAI = new GoogleGenerativeAI(environment.env.GOOGLE_API_KEY);
    const modelName = environment.env.MODEL_NAME || "gemini-2.5-flash";

    console.log(`🤖 Using model: ${modelName}`);

    // Create a model instance
    const model = genAI.getGenerativeModel({ model: modelName });

    // Test with a simple prompt
    const prompt = "Respond with a short greeting";
    console.log(`📝 Testing with prompt: "${prompt}"`);

    // Generate content
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("✅ API connection successful!");
    console.log(`🔤 Response: "${text}"`);

    return { success: true, message: "API connection successful" };
  } catch (error) {
    console.error("❌ API connection failed:", error.message);

    // Provide more detailed error information
    if (error.message.includes("API_KEY_INVALID")) {
      console.error("❗ The API key is invalid. Please check your .env file.");
    } else if (error.message.includes("NOT_FOUND")) {
      console.error(
        `❗ The model ${environment.env.MODEL_NAME} might not exist. Try using "gemini-pro" instead.`
      );
    }

    return { success: false, error: error.message };
  }
}

// Run the test
testGeminiAPI()
  .then((result) => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
