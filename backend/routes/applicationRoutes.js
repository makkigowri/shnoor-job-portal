const express = require("express");
const {
  applyToJobHandler,withdrawApplicationHandler,listMyApplicationsHandler,listApplicantsHandler,updateApplicationStatusHandler
} = require("../controllers/applicationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/my", protect, authorizeRoles("jobseeker"), listMyApplicationsHandler);
router.get("/recruiter", protect, authorizeRoles("recruiter"), listApplicantsHandler);
router.patch("/:id/status", protect, authorizeRoles("recruiter"), updateApplicationStatusHandler);
router.post("/:jobId", protect, authorizeRoles("jobseeker"), applyToJobHandler);
router.patch("/:jobId/withdraw", protect, authorizeRoles("jobseeker"), withdrawApplicationHandler);
module.exports = router;