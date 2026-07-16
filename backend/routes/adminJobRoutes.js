const express = require("express");
const { listJobs, viewJob, updateJobStatus, deleteJob } = require("../controllers/adminJobController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/", protectAdmin, listJobs);
router.get("/:id", protectAdmin, viewJob);
router.patch("/:id/status", protectAdmin, updateJobStatus);
router.delete("/:id", protectAdmin, deleteJob);
module.exports = router;
