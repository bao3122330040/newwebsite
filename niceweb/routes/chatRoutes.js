// chatRoutes.js - Route definitions for chat features
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Chat session routes
router.post("/sessions", chatController.createSession);
router.get("/sessions/:id", chatController.getSessionById);
router.get("/sessions/user/:user_id", chatController.getSessionsByUser);
router.get("/sessions", chatController.getAllSessions);
router.put("/sessions/:id", chatController.updateSession);
router.delete("/sessions/:id", chatController.deleteSession);
router.post(
  "/sessions/with-message",
  chatController.createSessionWithFirstMessage
);

// Chat message routes
router.post("/messages", chatController.createMessage);
router.get(
  "/messages/session/:session_id",
  chatController.getMessagesBySession
);
router.get("/messages/:id", chatController.getMessageById);
router.put("/messages/:id", chatController.updateMessage);
router.delete("/messages/:id", chatController.deleteMessage);
router.get("/messages-count", chatController.getMessagesCount);

module.exports = router;
