const {
  getApplicationByUserAndJob,applyToJob,withdrawApplication,getApplicationsByUser,getApplicantsForRecruiter,getApplicationForRecruiter,updateApplicationStatus,getApplicantsForExport} = require("../models/applicationModel");
const { findJobById } = require("../models/jobModel");
const { getResumeByUserId } = require("../models/resumeModel");
const { createNotification } = require("../models/notificationModel");
const { assignPublishedAssessmentsToNewlyShortlistedCandidate } = require("../models/assessmentAssignmentModel");
const { getCompanyByRecruiterId } = require("../models/companyModel");
const ALLOWED_STATUSES = ["Under Review", "Shortlisted", "Rejected"];
const { sendEmail } = require("../services/emailService");
const { buildExportFilename, formatDate, sendExcelFile } = require("../utils/exportUtils");
const applyToJobHandler = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await findJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    if (job.status !== "Active") {
      return res.status(400).json({ success: false, message: "This job is no longer accepting applications" });
    }
    const resume = await getResumeByUserId(req.user.id);
    if (!resume || !resume.resume_path) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before applying to a job"
      });
    }
    const application = await applyToJob(req.user.id, jobId, resume.resume_path, resume.resume_filename);
    if (!application) {
      const existing = await getApplicationByUserAndJob(req.user.id, jobId);
      const status = existing ? existing.status : "Applied";
      return res.status(409).json({
        success: false,
        message: `You have already applied to this job (status: ${status})`
      });
    }
    createNotification(req.user.id, {
      title: "Application Submitted",
      message: `Your application for "${job.title}" has been submitted successfully.`,
      type: "success",
      relatedJobId: job.id
    }).catch((err) => console.error("Failed to create notification:", err.message));
    await sendEmail(
      req.user.email,
      "Application Received - SHNOOR Job Portal",
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2 style="color:#2c3e50;">Application Submitted Successfully</h2>
        <p>Dear <strong>${req.user.fullname}</strong>,</p>
        <p>
          Thank you for applying through <strong>SHNOOR Job Portal</strong>.
        </p>
        <p>Your application has been successfully received.</p>

        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td><strong>Job Title</strong></td>
            <td>${job.title}</td>
          </tr>

          <tr>
            <td><strong>Location</strong></td>
            <td>${job.location}</td>
          </tr>
        </table>
        <br>
        <p>
          Our recruitment team will review your application.
          If you are shortlisted, you will receive another email with the next steps.
        </p>
        <br>
        <a href="http://localhost:5173/login"
          style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
          Login to SHNOOR
        </a>
        <br><br>
        <p>Regards,</p>
        <p><strong>SHNOOR Recruitment Team</strong></p>
      </div>
    `
    );
    if (job.recruiter_id) {
      createNotification(job.recruiter_id, {
        title: "New Application Received",
        message: `${req.user.fullname || "A candidate"} applied for "${job.title}".`,
        type: "info",
        relatedJobId: job.id
      }).catch((err) => console.error("Failed to create notification:", err.message));
    }
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
      atsResult: null
    });
  } catch (error) {
    next(error);
  }
};
const withdrawApplicationHandler = async (req, res, next) => {
  try {
    const application = await withdrawApplication(req.user.id, req.params.jobId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Active application not found for this job"
      });
    }
    const job = await findJobById(req.params.jobId);
    createNotification(req.user.id, {
      title: "Application Withdrawn",
      message: `You withdrew your application for "${job ? job.title : "this job"}".`,
      type: "warning",
      relatedJobId: req.params.jobId
    }).catch((err) => console.error("Failed to create notification:", err.message));
    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};
const listMyApplicationsHandler = async (req, res, next) => {
  try {
    const applications = await getApplicationsByUser(req.user.id);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};
const listApplicantsHandler = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    const applicants = await getApplicantsForRecruiter(req.user.id, { jobId, status });
    res.status(200).json({ success: true, applicants });
  } catch (error) {
    next(error);
  }
};
const updateApplicationStatusHandler = async (req, res, next) => {
  try {
    const { status, recruiterNote } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`
      });
    }
    const application = await updateApplicationStatus(req.params.id, req.user.id, status, recruiterNote);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or you do not have permission to update it"
      });
    }
    const job = await findJobById(application.job_id);
    const notificationCopy = {
      Shortlisted: {
        title: "You've Been Shortlisted!",
        message: `Great news! You have been shortlisted for "${job ? job.title : "a job"}".`,
        type: "success"
      },
      Rejected: {
        title: "Application Update",
        message: `Your application for "${job ? job.title : "a job"}" was not selected this time.`,
        type: "warning"
      },
      "Under Review": {
        title: "Application Under Review",
        message: `Your application for "${job ? job.title : "a job"}" is now under review.`,
        type: "info"
      }
    }[status];
    if (notificationCopy) {
      createNotification(application.user_id, {
        ...notificationCopy,
        relatedJobId: application.job_id
      }).catch((err) => console.error("Failed to create notification:", err.message));
    }
    if (status === "Shortlisted") {
      try {
        const newlyAssigned = await assignPublishedAssessmentsToNewlyShortlistedCandidate(
          application.job_id,
          application.user_id,
          application.id
        );
        if (newlyAssigned.length > 0) {
          const company = await getCompanyByRecruiterId(req.user.id).catch(() => null);
          const companyName = (company && company.company_name) || "The recruiter";
          const jobTitle = job ? job.title : "the role you applied for";
          newlyAssigned.forEach((assignment) => {
            createNotification(application.user_id, {
              title: "New Assessment Assigned",
              message: `${companyName} has assigned a new assessment for ${jobTitle}. Check "My Assessments" to get started.`,
              type: "info",
              relatedJobId: application.job_id
            }).catch((err) => console.error("Failed to create assessment notification:", err.message));
          });
        }
        await sendEmail(
            application.candidate_email,
            "Congratulations! You have been shortlisted",
              `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px;">
              <h2 style="color:#3E3A74;">Congratulations!</h2>
              <p>Dear <strong>${application.candidate_name}</strong>,</p>
              <p>
              We are pleased to inform you that you have been shortlisted for the position of
              <strong>${job.title}</strong>.
              </p>
              <p>
              The next stage of the recruitment process is an online technical assessment.
              </p>
              <p>
              Please log in to SHNOOR Job Portal and complete your assessment.
              </p>
              <a href="http://localhost:5173/user/my-assessments"
              style="
              display:inline-block;
              padding:12px 24px;
              background:#4F46E5;
              color:white;
              text-decoration:none;
              border-radius:6px;">
              Start Assessment
              </a>
              <br><br>
              <p>
              We wish you all the best.
              </p>
              Regards,<br>              <strong>SHNOOR Recruitment Team</strong>

            </div>
    `
    );
      } catch (assignError) {
        console.error("Auto-assignment on shortlist failed:", assignError.message);
      }
    }
    if(status==="Rejected"){
    await sendEmail(
    application.candidate_email,
    "Application Status Update",
    `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px;">
    <h2 style="color:#B91C1C;">
    Application Update
    </h2>
    <p>Dear <strong>${application.candidate_name}</strong>,</p>
    <p>
    Thank you for applying for the position of
    <strong>${job.title}</strong>.
    </p>
    <p>
    After careful consideration,
    we regret to inform you that you have not been selected for the next stage of the recruitment process.
    </p>
    <p>
    We sincerely appreciate your interest in joining our organization and encourage you to apply for future opportunities that match your profile.
    </p>
    <br>
    Regards,<br>
    <strong>SHNOOR Recruitment Team</strong>
    </div>
    `
    );
    }
    res.status(200).json({
      success: true,
      message: `Application marked as ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};
const exportApplicantsHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await findJobById(jobId);
    if (!job || job.recruiter_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to export applicants for this job"
      });
    }
    const applicants = await getApplicantsForExport(jobId, req.user.id);
    const columns = [
      "Applicant Name","Email","Phone Number","Resume","Application Status","Assessment Status","AI Interview Status","Technical Interview Status","Applied Date"
    ];
    const rows = applicants.map((a) => [
      a.applicant_name,a.applicant_email,a.applicant_phone || "",a.resume_filename || "",a.application_status,a.assessment_status,a.ai_interview_status,a.technical_interview_status,formatDate(a.applied_at)
    ]);
    const filename = buildExportFilename("Applicants", job.title);
    await sendExcelFile(res, filename, columns, rows);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  applyToJobHandler,withdrawApplicationHandler,listMyApplicationsHandler,listApplicantsHandler,updateApplicationStatusHandler,exportApplicantsHandler
};