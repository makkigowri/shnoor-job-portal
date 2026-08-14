const express = require("express");
const { listActivity, markRead, markAllRead, markCategoryRead } = require("../controllers/adminActivityController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/", protectAdmin, listActivity);
router.patch("/read", protectAdmin, markRead);
router.patch("/read-all", protectAdmin, markAllRead);
router.patch("/read-category", protectAdmin, markCategoryRead);
module.exports = router;
