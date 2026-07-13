const express = require("express");
const { getMyCompany, saveMyCompany, uploadCompanyLogo } = require("../controllers/companyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();
router.get("/", protect, authorizeRoles("recruiter"), getMyCompany);
router.put("/", protect, authorizeRoles("recruiter"), saveMyCompany);
router.post("/logo",protect,authorizeRoles("recruiter"),upload.single("companyLogo"),uploadCompanyLogo);
module.exports = router;
