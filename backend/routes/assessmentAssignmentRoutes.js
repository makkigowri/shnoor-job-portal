const express = require("express");
const {
  assignAssessmentHandler,
  removeAssignmentHandler,
  getAssignedCandidatesHandler,
  getPendingAssessmentsHandler,
  getUpcomingAssessmentsHandler,
  getCompletedAssessmentsHandler
} = require("../controllers/assessmentAssignmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { handleValidation } = require("../middleware/validate");
const { validateAssignAssessment } = require("../middleware/assessmentValidator");
const router = express.Router();
router.get("/candidate/pending", protect, authorizeRoles("jobseeker"), getPendingAssessmentsHandler);
router.get("/candidate/upcoming", protect, authorizeRoles("jobseeker"), getUpcomingAssessmentsHandler);
router.get("/candidate/completed", protect, authorizeRoles("jobseeker"), getCompletedAssessmentsHandler);
router.post("/:assessmentId", protect, authorizeRoles("recruiter"), validateAssignAssessment, handleValidation, assignAssessmentHandler);
router.get("/:assessmentId/candidates", protect, authorizeRoles("recruiter"), getAssignedCandidatesHandler);
router.delete("/:id", protect, authorizeRoles("recruiter"), removeAssignmentHandler);
module.exports = router;
