const offerLetterModel = require("../models/offerLetterModel");


const sendOfferLetter = async (req, res) => {
  try {
    const {
      applicationId,
      candidateId,
      fileUrl,
      message,
    } = req.body;

    const recruiterId = req.user.id;

    if (!applicationId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Application ID and Candidate ID are required.",
      });
    }

    const offer = await offerLetterModel.createOfferLetter({
      applicationId,
      recruiterId,
      candidateId,
      fileUrl,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Offer Letter sent successfully.",
      offer,
    });

  } catch (error) {
    console.error("Send Offer Letter Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send offer letter.",
    });
  }
};


const getOfferLetter = async (req, res) => {
  try {

    const { applicationId } = req.params;

    const offer =
      await offerLetterModel.getOfferLetterByApplication(applicationId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer Letter not found.",
      });
    }

    await offerLetterModel.markOfferViewed(offer.id);

    return res.json({
      success: true,
      offer,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

module.exports = {
  sendOfferLetter,
  getOfferLetter,
};