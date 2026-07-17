const express = require("express");
const {
  listEligibleHandler,
  scheduleHandler,
  listRecruiterHandler,
  listCandidateHandler,
  getRoomHandler,
  joinHandler,
  endMeetingHandler,
  submitResultHandler,
  getAdminStatsHandler
} = require("../controllers/technicalInterviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();

router.get("/eligible", protect, authorizeRoles("recruiter"), listEligibleHandler);
router.post("/schedule", protect, authorizeRoles("recruiter"), scheduleHandler);
router.get("/recruiter", protect, authorizeRoles("recruiter"), listRecruiterHandler);
router.get("/my", protect, authorizeRoles("jobseeker"), listCandidateHandler);
router.get("/admin/stats", protectAdmin, getAdminStatsHandler);
router.get("/room/:roomCode", protect, authorizeRoles("jobseeker", "recruiter"), getRoomHandler);
router.post("/room/:roomCode/join", protect, authorizeRoles("jobseeker", "recruiter"), joinHandler);
router.post("/room/:roomCode/end", protect, authorizeRoles("jobseeker", "recruiter"), endMeetingHandler);
router.post("/:id/result", protect, authorizeRoles("recruiter"), submitResultHandler);

module.exports = router;
