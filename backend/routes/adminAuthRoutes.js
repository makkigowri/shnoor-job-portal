const express = require("express");
const { adminLogin, getAdminProfile, changeAdminPassword, deleteAdminAccount } = require("../controllers/adminAuthController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.post("/login", adminLogin);
router.get("/profile", protectAdmin, getAdminProfile);
router.put("/change-password", protectAdmin, changeAdminPassword);
router.delete("/account", protectAdmin, deleteAdminAccount);
module.exports = router;
