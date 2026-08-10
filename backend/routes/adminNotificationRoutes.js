const express = require("express");
const {
  sendNotification,listNotificationHistory,deleteNotification} = require("../controllers/adminNotificationController");
const { listContactRequests } = require("../controllers/contactRequestController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.post("/", protectAdmin, sendNotification);
router.get("/", protectAdmin, listNotificationHistory);
router.get("/contact-requests", protectAdmin, listContactRequests);
router.delete("/:id", protectAdmin, deleteNotification);
module.exports = router;
