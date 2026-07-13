const express = require("express");
const { getDashboardSummary, getRecruiterDashboardSummary } = require("../controllers/dashboardController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", protect, authorizeRoles("jobseeker"), getDashboardSummary);
router.get("/recruiter", protect, authorizeRoles("recruiter"), getRecruiterDashboardSummary);
module.exports = router;
