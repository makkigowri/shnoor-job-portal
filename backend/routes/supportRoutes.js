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

module.exports = router;