const express = require("express");
const {
  getMyResume,
  getMyResumes,
  uploadMyResume,
  uploadAdditionalResume,
  deleteMyResume,
  deleteAdditionalResume,
} = require("../controllers/resumeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();
router.get("/", protect, authorizeRoles("jobseeker"), getMyResume);
router.post("/", protect, authorizeRoles("jobseeker"), upload.single("resume"), uploadMyResume);
router.delete("/", protect, authorizeRoles("jobseeker"), deleteMyResume);
router.get(
  "/all",
  protect,
  authorizeRoles("jobseeker"),
  getMyResumes
);

router.post(
  "/add",
  protect,
  authorizeRoles("jobseeker"),
  upload.single("resume"),
  uploadAdditionalResume
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("jobseeker"),
  deleteAdditionalResume
);
module.exports = router;