// userRoutes.js - Route definitions for user features
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.createUser);
router.get("/:id", userController.getUserById);
router.get("/", userController.getAllUsers);
router.get("/by-email", userController.getUserByEmail);
router.get("/by-username", userController.getUserByUsername);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/count/all", userController.getUsersCount);

module.exports = router;
