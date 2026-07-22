const express = require("express");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const { globalSearchAdmin } = require("../controllers/adminSearchController");
const router = express.Router();
router.get("/", protectAdmin, globalSearchAdmin);
module.exports = router;
