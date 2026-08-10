const { createContactRequest, getContactRequests } = require("../models/contactRequestModel");
const submitContactRequest = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }
    const trimmed = mobileNumber.trim();
    if (!/^[0-9+\-\s]{7,15}$/.test(trimmed)) {
      return res.status(400).json({ success: false, message: "Please enter a valid mobile number" });
    }
    const request = await createContactRequest(trimmed);
    res.status(201).json({
      success: true,
      message: "Your request has been submitted. Our team will contact you shortly.",
      request
    });
  } catch (error) {
    next(error);
  }
};
const listContactRequests = async (req, res, next) => {
  try {
    const requests = await getContactRequests(50);
    res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};
module.exports = { submitContactRequest, listContactRequests };
