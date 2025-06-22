const express = require("express");
const router = express.Router();
const GeminiService = require("../services/geminiService");
const {
  validateChatMessage,
  sanitizeInput,
} = require("../middleware/validation");

// Initialize Gemini service
const geminiService = new GeminiService();

// Chat sessions storage (in production, use database)
const chatSessions = new Map();

// POST /api/chatbot/chat
router.post("/chat", sanitizeInput, validateChatMessage, async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Get or create chat session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }

    const chatHistory = chatSessions.get(sessionId);

    // Generate response using Gemini
    const response = await geminiService.generateResponse(message, chatHistory);

    // Update chat history
    chatHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: response }
    );

    // Keep only last 20 messages to prevent memory issues
    if (chatHistory.length > 20) {
      chatHistory.splice(0, chatHistory.length - 20);
    }

    res.json({
      response: response,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      message: error.message,
    });
  }
});

// GET /api/chatbot/health
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Chatbot API",
    timestamp: new Date().toISOString(),
  });
});

// DELETE /api/chatbot/session/:sessionId
router.delete("/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  if (chatSessions.has(sessionId)) {
    chatSessions.delete(sessionId);
    res.json({ message: "Session cleared successfully" });
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// GET /api/chatbot/sessions
router.get("/sessions", (req, res) => {
  const sessions = Array.from(chatSessions.keys());
  res.json({
    sessions: sessions,
    count: sessions.length,
  });
});

module.exports = router;
