const express = require("express");
const {saveJobHandler, removeSavedJobHandler, listSavedJobsHandler} = require("../controllers/savedJobController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", protect, authorizeRoles("jobseeker"), listSavedJobsHandler);
router.post("/:jobId", protect, authorizeRoles("jobseeker"), saveJobHandler);
router.delete("/:jobId", protect, authorizeRoles("jobseeker"), removeSavedJobHandler);
module.exports = router;