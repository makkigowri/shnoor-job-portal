const express = require("express");
const { analyzeResume } = require("../controllers/atsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();
router.post("/analyze", protect, authorizeRoles("recruiter"), upload.single("resume"), analyzeResume);
module.exports = router;
