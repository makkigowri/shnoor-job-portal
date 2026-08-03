const express = require("express");
const {
  getMyResume,
  getMyResumes,
  uploadMyResume,
  uploadAdditionalResume,
  replaceResume,
  setDefaultResume,
  downloadResume,
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

router.put(
  "/:id/replace",
  protect,
  authorizeRoles("jobseeker"),
  upload.single("resume"),
  replaceResume
);

router.put(
  "/:id/default",
  protect,
  authorizeRoles("jobseeker"),
  setDefaultResume
);

router.get(
  "/:id/download",
  protect,
  authorizeRoles("jobseeker"),
  downloadResume
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("jobseeker"),
  deleteAdditionalResume
);
module.exports = router;
