const express = require("express");
const { getAdminDashboard, getAdminAnalytics } = require("../controllers/adminDashboardController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/", protectAdmin, getAdminDashboard);
router.get("/analytics", protectAdmin, getAdminAnalytics);
module.exports = router;
