const express = require("express");
const { getMyResume, uploadMyResume, deleteMyResume } = require("../controllers/resumeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();
router.get("/", protect, authorizeRoles("jobseeker"), getMyResume);
router.post("/", protect, authorizeRoles("jobseeker"), upload.single("resume"), uploadMyResume);
router.delete("/", protect, authorizeRoles("jobseeker"), deleteMyResume);
module.exports = router;