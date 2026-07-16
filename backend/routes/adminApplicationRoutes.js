const express = require("express");
const { listApplications, viewApplication, deleteApplication } = require("../controllers/adminApplicationController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/", protectAdmin, listApplications);
router.get("/:id", protectAdmin, viewApplication);
router.delete("/:id", protectAdmin, deleteApplication);
module.exports = router;
