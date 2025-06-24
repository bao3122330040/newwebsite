const express = require("express");
const router = express.Router();
const LangChainGeminiService = require("../services/langchainGeminiService");
const {
  validateChatMessage,
  sanitizeInput,
} = require("../middleware/validation");

// Initialize LangChain Gemini service
const langchainService = new LangChainGeminiService();

// POST /api/chatbot/chat
router.post("/chat", sanitizeInput, validateChatMessage, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Generate response using LangChain
    const result = await langchainService.generateResponse(message, sessionId);

    res.json({
      response: result.response,
      sessionId: result.sessionId,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      message: error.message,
    });
  }
});

// POST /api/chatbot/chat/stream - For streaming responses
router.post(
  "/chat/stream",
  sanitizeInput,
  validateChatMessage,
  async (req, res) => {
    try {
      const { message, sessionId } = req.body;

      if (!message) {
        return res.status(400).json({
          error: "Message is required",
        });
      }

      // Set up Server-Sent Events
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      let fullResponse = "";

      // Stream response
      const result = await langchainService.generateStreamResponse(
        message,
        sessionId,
        (chunk) => {
          fullResponse += chunk;
          res.write(
            `data: ${JSON.stringify({
              type: "chunk",
              content: chunk,
              fullResponse: fullResponse,
            })}\n\n`
          );
        }
      );

      // Send final message
      res.write(
        `data: ${JSON.stringify({
          type: "complete",
          response: result.response,
          sessionId: result.sessionId,
          timestamp: result.timestamp,
        })}\n\n`
      );

      res.end();
    } catch (error) {
      console.error("Streaming chat error:", error);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: "Failed to generate response",
          message: error.message,
        })}\n\n`
      );
      res.end();
    }
  }
);

// GET /api/chatbot/products - Get gaming products info
router.get("/products", (req, res) => {
  try {
    const products = langchainService.getGamingProducts();
    res.json({
      products: products,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({
      error: "Failed to get products",
      message: error.message,
    });
  }
});

// GET /api/chatbot/deals - Get current deals
router.get("/deals", (req, res) => {
  try {
    const deals = langchainService.getCurrentDeals();
    res.json({
      deals: deals,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deals error:", error);
    res.status(500).json({
      error: "Failed to get deals",
      message: error.message,
    });
  }
});

// GET /api/chatbot/health
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LangChain Gemini Chatbot API",
    timestamp: new Date().toISOString(),
  });
});

// DELETE /api/chatbot/session/:sessionId
router.delete("/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  try {
    langchainService.clearConversationHistory(sessionId);
    res.json({ message: "Session cleared successfully" });
  } catch (error) {
    console.error("Clear session error:", error);
    res.status(500).json({
      error: "Failed to clear session",
      message: error.message,
    });
  }
});

// GET /api/chatbot/sessions
router.get("/sessions", (req, res) => {
  try {
    const sessions = langchainService.getActiveSessions();
    res.json({
      sessions: sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      error: "Failed to get sessions",
      message: error.message,
    });
  }
});

// GET /api/chatbot/session/:sessionId/history
router.get("/session/:sessionId/history", (req, res) => {
  const { sessionId } = req.params;

  try {
    const history = langchainService.getConversationHistory(sessionId);
    res.json({
      sessionId: sessionId,
      history: history.map((msg) => ({
        role: msg.constructor.name === "HumanMessage" ? "user" : "assistant",
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      error: "Failed to get conversation history",
      message: error.message,
    });
  }
});

module.exports = router;

module.exports = router;
