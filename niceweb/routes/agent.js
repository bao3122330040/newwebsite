const express = require("express");
const router = express.Router();
const GameZoneAgent = require("../services/gameZoneAgent");
const {
  validateChatMessage,
  sanitizeInput,
} = require("../middleware/validation");

// Initialize GameZone Agent
let gameZoneAgent;

// Initialize agent with error handling
async function initializeAgent() {
  try {
    gameZoneAgent = new GameZoneAgent();
    console.log("✅ GameZone Agent initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize GameZone Agent:", error.message);
    throw error;
  }
}

// Initialize agent on module load
initializeAgent().catch(console.error);

// POST /api/agent/chat
router.post("/chat", sanitizeInput, validateChatMessage, async (req, res) => {
  try {
    if (!gameZoneAgent) {
      return res.status(503).json({
        error: "Agent not initialized",
        message: "Please try again in a moment",
      });
    }

    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Process message through agent
    const result = await gameZoneAgent.processMessage(message, sessionId);

    res.json({
      response: result.response,
      sessionId: result.sessionId,
      timestamp: result.timestamp,
      toolsUsed: result.toolsUsed,
      agent: "GameZone AI Assistant",
    });
  } catch (error) {
    console.error("Agent chat error:", error);
    res.status(500).json({
      error: "Failed to process message",
      message: error.message,
    });
  }
});

// GET /api/agent/capabilities
router.get("/capabilities", (req, res) => {
  try {
    const capabilities = {
      agent_type: "GameZone AI Assistant",
      description: "Advanced gaming consultant with specialized tools",
      tools: [
        {
          name: "Product Information",
          description: "Get detailed info about gaming products by category",
        },
        {
          name: "Current Deals",
          description: "Access latest deals and promotions",
        },
        {
          name: "Product Recommendations",
          description: "Personalized product suggestions based on needs",
        },
        {
          name: "Price Calculator",
          description: "Calculate prices, discounts, and bundle deals",
        },
        {
          name: "Compatibility Checker",
          description: "Verify component compatibility",
        },
        {
          name: "Gaming Setup Builder",
          description: "Build complete gaming setups by budget",
        },
        {
          name: "Store Information",
          description: "Provide store details and policies",
        },
      ],
      features: [
        "Context-aware conversations",
        "Tool-assisted responses",
        "Gaming expertise",
        "Product recommendations",
        "Technical support",
        "Price calculations",
      ],
      specializations: [
        "PC Gaming",
        "Console Gaming",
        "Gaming Accessories",
        "Mobile Gaming",
        "Custom Builds",
      ],
    };

    res.json(capabilities);
  } catch (error) {
    console.error("Capabilities error:", error);
    res.status(500).json({
      error: "Failed to get capabilities",
      message: error.message,
    });
  }
});

// GET /api/agent/health
router.get("/health", (req, res) => {
  const isHealthy = gameZoneAgent !== null;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    service: "GameZone AI Agent",
    agent_initialized: !!gameZoneAgent,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/agent/reinitialize
router.post("/reinitialize", async (req, res) => {
  try {
    await initializeAgent();
    res.json({
      message: "Agent reinitialized successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reinitialize error:", error);
    res.status(500).json({
      error: "Failed to reinitialize agent",
      message: error.message,
    });
  }
});

module.exports = router;
