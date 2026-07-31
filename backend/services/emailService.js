const nodemailer = require("nodemailer");
const path = require("path");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SHNOOR Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,

      attachments: [
        {
          filename: "shnoor_logo.jpeg",
          path: path.join(
            __dirname,
            "../public/images/shnoor_logo.jpeg"
          ),
          cid: "shnoorlogo",
        },
      ],
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};
module.exports = {
  sendEmail,
};