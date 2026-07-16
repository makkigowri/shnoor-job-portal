const express = require("express");
const {
  getAppSettings,
  saveAppSettings,
  uploadAppLogo,
  changeAdminSettingsPassword
} = require("../controllers/adminSettingsController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();
router.get("/", protectAdmin, getAppSettings);
router.put("/", protectAdmin, saveAppSettings);
router.post("/logo", protectAdmin, upload.single("companyLogo"), uploadAppLogo);
router.put("/change-password", protectAdmin, changeAdminSettingsPassword);
module.exports = router;
