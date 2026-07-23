const express = require("express");
const { handleChatMessage } = require("../controllers/chatbotController");
const router = express.Router();
router.post("/message", handleChatMessage);
module.exports = router;
