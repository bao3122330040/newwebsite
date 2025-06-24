// Demo script để test GameZone Chatbot
// Chạy: node demo.js

const axios = require("axios").default;

const BASE_URL = "http://localhost:5000";

// Test messages
const testMessages = [
  "Xin chào, tôi muốn mua laptop gaming",
  "Tôi có budget 20 triệu, tư vấn cho tôi build PC gaming",
  "RTX 4090 giá bao nhiêu?",
  "Kiểm tra khả năng tương thích RTX 4080 với i7-13700K",
  "Có deal gì hot không?",
  "Thông tin liên hệ cửa hàng",
];

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

// Test health endpoints
async function testHealth() {
  log(colors.yellow, "\n🏥 Testing Health Endpoints...");

  try {
    // Test chatbot health
    const chatbotHealth = await axios.get(`${BASE_URL}/api/chatbot/health`);
    log(colors.green, "✅ Chatbot health:", chatbotHealth.data.status);

    // Test agent health
    const agentHealth = await axios.get(`${BASE_URL}/api/agent/health`);
    log(colors.green, "✅ Agent health:", agentHealth.data.status);

    return true;
  } catch (error) {
    log(colors.red, "❌ Health check failed:", error.message);
    return false;
  }
}

// Test agent capabilities
async function testCapabilities() {
  log(colors.yellow, "\n🔧 Testing Agent Capabilities...");

  try {
    const response = await axios.get(`${BASE_URL}/api/agent/capabilities`);
    log(colors.green, "✅ Agent capabilities:");
    response.data.tools.forEach((tool) => {
      log(colors.cyan, `  - ${tool.name}: ${tool.description}`);
    });
    return true;
  } catch (error) {
    log(colors.red, "❌ Capabilities test failed:", error.message);
    return false;
  }
}

// Test products endpoint
async function testProducts() {
  log(colors.yellow, "\n🎮 Testing Products Endpoint...");

  try {
    const response = await axios.get(`${BASE_URL}/api/chatbot/products`);
    log(colors.green, "✅ Products loaded successfully");
    log(
      colors.cyan,
      `Found ${Object.keys(response.data.products).length} product categories`
    );
    return true;
  } catch (error) {
    log(colors.red, "❌ Products test failed:", error.message);
    return false;
  }
}

// Test deals endpoint
async function testDeals() {
  log(colors.yellow, "\n💰 Testing Deals Endpoint...");

  try {
    const response = await axios.get(`${BASE_URL}/api/chatbot/deals`);
    log(colors.green, "✅ Deals loaded successfully");
    log(
      colors.cyan,
      `Featured deal: ${response.data.deals.featured_deal.title}`
    );
    return true;
  } catch (error) {
    log(colors.red, "❌ Deals test failed:", error.message);
    return false;
  }
}

// Test chat with agent
async function testChat() {
  log(colors.yellow, "\n💬 Testing Chat with Agent...");

  let sessionId = null;

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];

    try {
      log(colors.blue, `\n👤 User: ${message}`);

      const response = await axios.post(`${BASE_URL}/api/agent/chat`, {
        message: message,
        sessionId: sessionId,
      });

      // Update session ID
      if (response.data.sessionId) {
        sessionId = response.data.sessionId;
      }

      log(colors.green, `🤖 Agent: ${response.data.response}`);

      // Show tools used if any
      if (response.data.toolsUsed && response.data.toolsUsed.length > 0) {
        log(
          colors.magenta,
          `🔧 Tools used: ${response.data.toolsUsed.join(", ")}`
        );
      }

      // Wait between messages
      if (i < testMessages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      log(
        colors.red,
        `❌ Chat test failed for message ${i + 1}:`,
        error.message
      );
      if (error.response?.data) {
        log(colors.red, "Error details:", error.response.data);
      }
    }
  }

  return sessionId;
}

// Test conversation history
async function testHistory(sessionId) {
  if (!sessionId) return;

  log(colors.yellow, "\n📚 Testing Conversation History...");

  try {
    const response = await axios.get(
      `${BASE_URL}/api/chatbot/session/${sessionId}/history`
    );
    log(
      colors.green,
      `✅ History retrieved: ${response.data.history.length} messages`
    );

    // Show last few messages
    const lastMessages = response.data.history.slice(-4);
    lastMessages.forEach((msg, index) => {
      const emoji = msg.role === "user" ? "👤" : "🤖";
      const color = msg.role === "user" ? colors.blue : colors.green;
      log(color, `${emoji} ${msg.role}: ${msg.content.substring(0, 100)}...`);
    });
  } catch (error) {
    log(colors.red, "❌ History test failed:", error.message);
  }
}

// Test streaming chat
async function testStreaming() {
  log(colors.yellow, "\n🌊 Testing Streaming Chat...");

  try {
    const message =
      "Hãy giải thích chi tiết về RTX 4090 và so sánh với RTX 4080";
    log(colors.blue, `👤 User: ${message}`);

    const response = await axios({
      method: "post",
      url: `${BASE_URL}/api/chatbot/chat/stream`,
      data: { message: message },
      responseType: "stream",
    });

    log(colors.green, "🤖 Agent (streaming):");

    let streamData = "";
    response.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      lines.forEach((line) => {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.type === "chunk") {
              process.stdout.write(colors.green + data.content + colors.reset);
              streamData += data.content;
            } else if (data.type === "complete") {
              console.log("\n");
              log(colors.cyan, "✅ Streaming complete");
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    });

    return new Promise((resolve) => {
      response.data.on("end", () => {
        resolve(true);
      });
    });
  } catch (error) {
    log(colors.red, "❌ Streaming test failed:", error.message);
    return false;
  }
}

// Main test function
async function runDemo() {
  log(colors.bright, "🎮 GameZone Chatbot Demo Starting...\n");

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/`);
    log(colors.green, "✅ Server is running at", BASE_URL);
  } catch (error) {
    log(colors.red, "❌ Server is not running. Please start with: npm start");
    process.exit(1);
  }

  // Run tests
  const healthOk = await testHealth();
  if (!healthOk) {
    log(colors.red, "❌ Health check failed. Stopping demo.");
    process.exit(1);
  }

  await testCapabilities();
  await testProducts();
  await testDeals();

  const sessionId = await testChat();
  await testHistory(sessionId);
  await testStreaming();

  log(colors.bright, "\n🎉 Demo completed! Check the results above.");
  log(colors.yellow, "\n📝 Tips:");
  log(colors.cyan, "  - Open http://localhost:5000 to see the website");
  log(colors.cyan, "  - Click the chat button in bottom-right corner");
  log(colors.cyan, "  - Try asking about gaming products, prices, or builds");
  log(colors.cyan, "  - Check browser developer tools for detailed logs");
}

// Error handling
process.on("unhandledRejection", (error) => {
  log(colors.red, "❌ Unhandled error:", error.message);
  process.exit(1);
});

// Run demo
if (require.main === module) {
  runDemo().catch((error) => {
    log(colors.red, "❌ Demo failed:", error.message);
    process.exit(1);
  });
}

module.exports = { runDemo, testHealth, testChat };
