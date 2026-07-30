const express = require("express");
const {
  scheduleInterviewHandler,
  listInterviewsHandler,
  listMyInterviewsHandler,
  rescheduleInterviewHandler,
  updateInterviewStatusHandler,
  releaseInterviewResultHandler,listEligibleCandidatesHandler,
} = require("../controllers/interviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, authorizeRoles("recruiter"), scheduleInterviewHandler);
router.get(
  "/eligible",
  protect,
  authorizeRoles("recruiter"),
  listEligibleCandidatesHandler
);
router.get("/", protect, authorizeRoles("recruiter"), listInterviewsHandler);
router.get("/my", protect, authorizeRoles("jobseeker"), listMyInterviewsHandler);
router.patch("/:id", protect, authorizeRoles("recruiter"), rescheduleInterviewHandler);
router.patch("/:id/status", protect, authorizeRoles("recruiter"), updateInterviewStatusHandler);
router.patch(
  "/:id/result",
  protect,
  authorizeRoles("recruiter"),
  releaseInterviewResultHandler
);
module.exports = router;
