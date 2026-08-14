const express = require("express");
const {
  sendAnnouncement,listAnnouncementHistory,deleteAnnouncement} = require("../controllers/adminAnnouncementController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.post("/", protectAdmin, sendAnnouncement);
router.get("/", protectAdmin, listAnnouncementHistory);
router.delete("/:id", protectAdmin, deleteAnnouncement);
module.exports = router;
