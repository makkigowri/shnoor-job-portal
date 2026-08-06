const {
  listRecruitersAdmin,getRecruiterByIdAdmin,setUserBlockedStatus,deleteUserAdminById, createRecruiterAdmin} = require("../models/adminStatsModel");
const listRecruiters = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const result = await listRecruitersAdmin({ search, status, page: Number(page), limit: Number(limit) });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
const { sendEmail } = require("../services/emailService");
const viewRecruiter = async (req, res, next) => {
  try {
    const recruiter = await getRecruiterByIdAdmin(req.params.id);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, recruiter });
  } catch (error) {
    next(error);
  }
};
const blockRecruiter = async (req, res, next) => {
  try {
    const recruiter = await setUserBlockedStatus(req.params.id, true);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, message: "Recruiter blocked successfully", recruiter });
  } catch (error) {
    next(error);
  }
};
const unblockRecruiter = async (req, res, next) => {
  try {
    const recruiter = await setUserBlockedStatus(req.params.id, false);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, message: "Recruiter unblocked successfully", recruiter });
  } catch (error) {
    next(error);
  }
};
const deleteRecruiter = async (req, res, next) => {
  try {
    const deleted = await deleteUserAdminById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }
    res.status(200).json({ success: true, message: "Recruiter deleted successfully" });
  } catch (error) {
    next(error);
  }
};
const createRecruiter = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const recruiter = await createRecruiterAdmin({
      fullname,
      email,
      password
    });

    await sendEmail(
      email,
      "Recruiter Account Created - SHNOOR Job Portal",
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2 style="color:#3E3A74;">Welcome to SHNOOR Job Portal</h2>

        <p>Hello <strong>${fullname}</strong>,</p>

        <p>Your recruiter account has been created successfully.</p>

        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td><strong>Company</strong></td>
            <td>SHNOOR INTERNATIONAL LLC</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td>${email}</td>
          </tr>
          <tr>
            <td><strong>Password</strong></td>
            <td>${password}</td>
          </tr>
        </table>

        <br>

        <a href="http://localhost:5173/login"
        style="
        background:#4F46E5;
        color:white;
        padding:12px 22px;
        text-decoration:none;
        border-radius:6px;
        display:inline-block;">
        Login
        </a>

        <br><br>

        Regards,<br>
        <strong>SHNOOR Admin Team</strong>
      </div>
      `
    );

    res.status(201).json({
      success: true,
      message: "Recruiter created successfully.",
      recruiter
    });

  } catch (error) {
    next(error);
  }
};
module.exports = { listRecruiters, viewRecruiter, blockRecruiter, unblockRecruiter, deleteRecruiter, createRecruiter };
