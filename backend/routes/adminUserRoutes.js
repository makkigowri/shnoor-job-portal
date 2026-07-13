const express = require("express");
const { listUsers, viewUser, blockUser, unblockUser, deleteUser } = require("../controllers/adminUserController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();

router.get("/", protectAdmin, listUsers);
router.get("/:id", protectAdmin, viewUser);
router.patch("/:id/block", protectAdmin, blockUser);
router.patch("/:id/unblock", protectAdmin, unblockUser);
router.delete("/:id", protectAdmin, deleteUser);

module.exports = router;
