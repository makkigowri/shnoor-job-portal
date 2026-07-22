const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { joinMeetingRoom } = require("../controllers/meetingController");
router.get("/join/:roomName", protect, joinMeetingRoom);
module.exports = router;