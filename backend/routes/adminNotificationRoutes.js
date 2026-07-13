const express = require("express");
const {
  sendNotification,
  listNotificationHistory,
  deleteNotification
} = require("../controllers/adminNotificationController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();

router.post("/", protectAdmin, sendNotification);
router.get("/", protectAdmin, listNotificationHistory);
router.delete("/:id", protectAdmin, deleteNotification);

module.exports = router;
