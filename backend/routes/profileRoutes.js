const express = require("express");
const { getMyProfile, saveMyProfile, uploadProfilePhoto } = require("../controllers/profileController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();
router.get("/", protect, authorizeRoles("jobseeker"), getMyProfile);
router.put("/", protect, authorizeRoles("jobseeker"), saveMyProfile);
router.post("/photo",protect, authorizeRoles("jobseeker"),upload.single("profilePhoto"),uploadProfilePhoto);
module.exports = router;
