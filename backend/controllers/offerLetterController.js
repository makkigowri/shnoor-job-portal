const offerLetterModel = require("../models/offerLetterModel");
const { sendEmail } = require("../services/emailService");

const sendOfferLetter = async (req, res) => {
  try {
    const {
      applicationId,
      candidateId,
      
      message,
    } = req.body;

    const recruiterId = req.user.id;

    if (!applicationId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Application ID and Candidate ID are required.",
      });
    }
    const details = await offerLetterModel.getOfferEmailDetails(applicationId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

    const offer = await offerLetterModel.createOfferLetter({
      applicationId,
      recruiterId,
      candidateId,
      
      message,
    });
    await sendEmail(
      details.candidate_email,
      `Congratulations! Offer for ${details.job_title}`,
      `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px;">

        <div style="text-align:center;margin-bottom:20px;">
          <img
            src="cid:shnoorlogo"
            alt="SHNOOR Logo"
            style="height:80px;"
          />
        </div>

        <h2 style="color:#3E3A74;text-align:center;">
          Congratulations!
        </h2>

        <p>Dear <strong>${details.candidate_name}</strong>,</p>

        <p>
          We are pleased to inform you that you have been selected for the position of
          <strong>${details.job_title}</strong> at
          <strong>SHNOOR International LLC</strong>.
        </p>

        <p>
          We were impressed with your performance throughout the recruitment process
          and are excited to welcome you to our team.
        </p>

        <h3>Offer Details</h3>

        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <td><strong>Position</strong></td>
            <td>${details.job_title}</td>
          </tr>

          <tr>
            <td><strong>CTC</strong></td>
            <td>${details.job_salary}</td>
          </tr>
        </table>

        ${
          message
            ? `
            <br>
            <p><strong>Additional Message:</strong></p>
            <p>${message}</p>
            `
            : ""
        }

        <br>

        <p>
          We will share additional onboarding details with you shortly.
        </p>

        <p>
          Congratulations once again, and we look forward to working with you.
        </p>

        <br>

        <p>
          Regards,<br>
          <strong>SHNOOR Recruitment Team</strong>
        </p>

      </div>
      `
    );
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