const express = require("express");
const {
  listRecruiters,viewRecruiter,blockRecruiter,unblockRecruiter,deleteRecruiter,createRecruiter} = require("../controllers/adminRecruiterController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
router.get("/", protectAdmin, listRecruiters);
router.get("/:id", protectAdmin, viewRecruiter);
router.patch("/:id/block", protectAdmin, blockRecruiter);
router.patch("/:id/unblock", protectAdmin, unblockRecruiter);
router.delete("/:id", protectAdmin, deleteRecruiter);
router.post("/", createRecruiter);
module.exports = router;
