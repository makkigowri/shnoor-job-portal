const express = require("express");
const {
  startAssessmentHandler,
  saveAnswersHandler,
  submitAssessmentHandler,
  autoSubmitAssessmentHandler,
  getMySubmissionHandler,
  getResultsHandler,
  getSubmissionDetailHandler
} = require("../controllers/assessmentSubmissionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { handleValidation } = require("../middleware/validate");
const { validateSaveAnswers } = require("../middleware/assessmentValidator");

const router = express.Router();

// Candidate routes
router.post("/start/:assignmentId", protect, authorizeRoles("jobseeker"), startAssessmentHandler);
router.patch("/:submissionId/save", protect, authorizeRoles("jobseeker"), validateSaveAnswers, handleValidation, saveAnswersHandler);
router.post("/:submissionId/submit", protect, authorizeRoles("jobseeker"), submitAssessmentHandler);
router.post("/:submissionId/auto-submit", protect, authorizeRoles("jobseeker"), autoSubmitAssessmentHandler);
router.get("/mine/:submissionId", protect, authorizeRoles("jobseeker"), getMySubmissionHandler);

// Recruiter routes
router.get("/assessment/:assessmentId/results", protect, authorizeRoles("recruiter"), getResultsHandler);
router.get("/:submissionId", protect, authorizeRoles("recruiter"), getSubmissionDetailHandler);

module.exports = router;
