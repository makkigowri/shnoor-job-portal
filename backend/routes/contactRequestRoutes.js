const express = require("express");
const { submitContactRequest } = require("../controllers/contactRequestController");
const router = express.Router();
router.post("/", submitContactRequest);
module.exports = router;
