const express = require("express");
const { listApplications, viewApplication, deleteApplication, exportApplicantsAdminHandler } = require("../controllers/adminApplicationController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/", protectAdmin, listApplications);
router.get("/export/job/:jobId", protectAdmin, exportApplicantsAdminHandler);
router.get("/:id", protectAdmin, viewApplication);
router.delete("/:id", protectAdmin, deleteApplication);
module.exports = router;
