const express = require("express");
const {
  createAssessmentHandler,
  updateAssessmentHandler,
  deleteAssessmentHandler,
  getAssessmentHandler,
  getAllAssessmentsHandler,
  publishAssessmentHandler,
  closeAssessmentHandler
} = require("../controllers/assessmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { handleValidation } = require("../middleware/validate");
const {
  validateCreateAssessment,
  validateUpdateAssessment,
  validateIdParam
} = require("../middleware/assessmentValidator");
const router = express.Router();
router.post("/", protect, authorizeRoles("recruiter"), validateCreateAssessment, handleValidation, createAssessmentHandler);
router.get("/", protect, authorizeRoles("recruiter"), getAllAssessmentsHandler);
router.get("/:id", protect, authorizeRoles("recruiter"), validateIdParam, handleValidation, getAssessmentHandler);
router.put("/:id", protect, authorizeRoles("recruiter"), validateIdParam, validateUpdateAssessment, handleValidation, updateAssessmentHandler);
router.delete("/:id", protect, authorizeRoles("recruiter"), validateIdParam, handleValidation, deleteAssessmentHandler);
router.patch("/:id/publish", protect, authorizeRoles("recruiter"), validateIdParam, handleValidation, publishAssessmentHandler);
router.patch("/:id/close", protect, authorizeRoles("recruiter"), validateIdParam, handleValidation, closeAssessmentHandler);
module.exports = router;
