const express = require("express");
const {
  sendUserSupportMessage,
  getMySupportConversation,
  getSupportConversations,
  getSupportConversation,
  replySupportMessage,
  submitSupportFeedback,
  supportAnalytics,
  resolveConversation,
  updateConversationStatus,
  deleteConversation,
  submitResolutionFeedback,
} = require("../controllers/supportController");
const { protect } = require("../middleware/authMiddleware");
const {
  protectAdmin,
} = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.post(
  "/message",
  protect,
  sendUserSupportMessage
);
router.get(
  "/conversation",
  protect,
  getMySupportConversation
);
router.post(
  "/feedback",
  protect,
  submitSupportFeedback
);
router.post(
  "/resolution-feedback",
  protect,
  submitResolutionFeedback
);
router.get(
  "/conversations",
  protectAdmin,
  getSupportConversations
);
router.get(
  "/conversation/:id",
  protectAdmin,
  getSupportConversation
);
router.post(
  "/reply",
  protectAdmin,
  replySupportMessage
);
router.get(
  "/analytics",
  protectAdmin,
  supportAnalytics
);
router.post(
  "/resolve",
  protectAdmin,
  resolveConversation
);
router.post(
  "/status",
  protectAdmin,
  updateConversationStatus
);
router.delete(
  "/conversation/:id",
  protectAdmin,
  deleteConversation
);
module.exports = router;