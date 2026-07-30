const express = require("express");

const router = express.Router();

const {
  sendOfferLetter,
  getOfferLetter,
} = require("../controllers/offerLetterController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/send",
  protect,
  authorizeRoles("recruiter"),
  sendOfferLetter
);


router.get(
  "/:applicationId",
  protect,
  getOfferLetter
);

module.exports = router;