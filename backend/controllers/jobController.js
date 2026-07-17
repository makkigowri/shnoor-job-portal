const { sendEmail } = require("../services/emailService");
const pool = require("../config/db");
const {createJob,updateJob,deleteJob,findJobById,findJobsByRecruiter,searchJobs} = require("../models/jobModel");
const postJob = async (req, res, next) => {
  try {
    const { title, location } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Job title is required" });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: "Job location is required" });
    }
    const job = await createJob(req.user.id, req.body);
    const users = await pool.query(
      "SELECT fullname, email FROM users WHERE role = 'jobseeker'"
    );
    for (const user of users.rows) {
      await sendEmail(
        user.email,
        "New Job Opportunity - SHNOOR Job Portal",
        `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
          <h2 style="color:#3E3A74;">New Job Opportunity</h2>
          <p>Dear <strong>${user.fullname}</strong>,</p>
          <p>A new job has been posted on <strong>SHNOOR Job Portal</strong>.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td><strong>Job Title</strong></td>
              <td>${job.title}</td>
            </tr>
            <tr>
              <td><strong>Location</strong></td>
              <td>${job.location}</td>
            </tr>
            <tr>
              <td><strong>Experience</strong></td>
              <td>${job.experience}</td>
            </tr>
            <tr>
              <td><strong>Employment Type</strong></td>
              <td>${job.employment_type}</td>
            </tr>
          </table>
          <br>
          <p>
          Login to SHNOOR Job Portal to view the complete job details and apply.
          </p>
          <a href="http://localhost:5173/login"
          style="
          background:#4F46E5;
          color:white;
          padding:12px 22px;
          text-decoration:none;
          border-radius:6px;
          display:inline-block;">
          View Job
          </a>
          <br><br>
          Regards,<br>
          <strong>SHNOOR Recruitment Team</strong>
        </div>
        `
      );
    }
    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job
    });
  } catch (error) {
    next(error);
  }
};
const editJob = async (req, res, next) => {
  try {
    const job = await updateJob(req.params.id, req.user.id, req.body);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or you do not have permission to edit it" });
    }
    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job
    });
  } catch (error) {
    next(error);
  }
};
const removeJob = async (req, res, next) => {
  try {
    const deleted = await deleteJob(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Job not found or you do not have permission to delete it" });
    }
    res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
const getJob = async (req, res, next) => {
  try {
    const job = await findJobById(req.params.id, req.user.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await findJobsByRecruiter(req.user.id);
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};
const searchJobsHandler = async (req, res, next) => {
  try {
    const { title, location, experience, employmentType, salaryMin, salaryMax, page, limit } = req.query;
    const result = await searchJobs(
      {
        title,
        location: location && location !== "Location" ? location : undefined,
        experience: experience && experience !== "Experience" ? experience : undefined,
        employmentType: employmentType && employmentType !== "Job Type" ? employmentType : undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10
      },
      req.user.id
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
module.exports = {postJob,editJob,removeJob,getJob,getMyJobs,searchJobsHandler};