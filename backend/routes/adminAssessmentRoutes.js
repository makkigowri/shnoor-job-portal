const express = require("express");
const { listAssessments, viewAssessment, deleteAssessment, getStatistics } = require("../controllers/adminAssessmentController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();

router.get("/", protectAdmin, listAssessments);
router.get("/stats/overview", protectAdmin, getStatistics);
router.get("/:id", protectAdmin, viewAssessment);
router.delete("/:id", protectAdmin, deleteAssessment);

module.exports = router;
