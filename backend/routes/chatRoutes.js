// chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/:id", chatController.getChat);
router.post("/", chatController.createChat);
router.delete("/:id", chatController.deleteChat);

module.exports = router;
