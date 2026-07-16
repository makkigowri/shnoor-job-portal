const express = require("express");
const {
  listMyInterviewsHandler,
  getByApplicationHandler,
  getInterviewHandler,
  startInterviewHandler,
  submitAnswerHandler,
  getInterviewForRecruiterHandler,
  listRecruiterInterviewsHandler,
  getAdminStatsHandler
} = require("../controllers/aiInterviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/my", protect, authorizeRoles("jobseeker"), listMyInterviewsHandler);
router.get("/by-application/:applicationId", protect, authorizeRoles("jobseeker"), getByApplicationHandler);
router.get("/recruiter", protect, authorizeRoles("recruiter"), listRecruiterInterviewsHandler);
router.get("/recruiter/:interviewId", protect, authorizeRoles("recruiter"), getInterviewForRecruiterHandler);
router.get("/admin/stats", protectAdmin, getAdminStatsHandler);
router.get("/:interviewId", protect, authorizeRoles("jobseeker"), getInterviewHandler);
router.post("/:interviewId/start", protect, authorizeRoles("jobseeker"), startInterviewHandler);
router.post("/:interviewId/answer", protect, authorizeRoles("jobseeker"), submitAnswerHandler);
module.exports = router;
