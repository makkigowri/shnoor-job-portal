const express = require("express");
const adminAuthRoutes = require("./adminAuthRoutes");
const adminDashboardRoutes = require("./adminDashboardRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const adminRecruiterRoutes = require("./adminRecruiterRoutes");
const adminJobRoutes = require("./adminJobRoutes");
const adminApplicationRoutes = require("./adminApplicationRoutes");
const adminNotificationRoutes = require("./adminNotificationRoutes");
const adminSettingsRoutes = require("./adminSettingsRoutes");

const router = express.Router();

router.use("/auth", adminAuthRoutes);
router.use("/dashboard", adminDashboardRoutes);
router.use("/users", adminUserRoutes);
router.use("/recruiters", adminRecruiterRoutes);
router.use("/jobs", adminJobRoutes);
router.use("/applications", adminApplicationRoutes);
router.use("/notifications", adminNotificationRoutes);
router.use("/settings", adminSettingsRoutes);

module.exports = router;
