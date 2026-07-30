const express = require("express");
const { handleChatMessage } = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/message", protect, handleChatMessage);

module.exports = router;