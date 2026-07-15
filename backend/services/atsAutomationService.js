const fs = require("fs");
const path = require("path");
const extractResumeText = require("../utils/extractResumeText");
const { scoreResumeAgainstJob } = require("../utils/atsScorer");
const { uploadDir } = require("../middleware/upload");
const { createNotification } = require("../models/notificationModel");
const { getCompanyByRecruiterId } = require("../models/companyModel");
const { sendEmail } = require("./emailService");
const { findUserById } = require("../models/userModel");
const {
  applyAtsResult,
  getProcessableApplicationsForUser
} = require("../models/applicationModel");
const {
  assignPublishedAssessmentsToNewlyShortlistedCandidate
} = require("../models/assessmentAssignmentModel");

const getAtsThreshold = () => {
  const configured = Number(process.env.ATS_AUTO_SHORTLIST_THRESHOLD);
  return Number.isFinite(configured) && configured > 0 ? configured : 80;
};

const MIME_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword"
};

const resolveResumeText = async (resume) => {
  if (resume && resume.resume_text && resume.resume_text.trim()) {
    return resume.resume_text;
  }
  if (!resume || !resume.resume_path) return null;
  const filename = path.basename(resume.resume_path);
  const fullPath = path.join(uploadDir, filename);
  if (!fs.existsSync(fullPath)) return null;
  const mimetype = MIME_BY_EXTENSION[path.extname(filename).toLowerCase()];
  if (!mimetype) return null;
  try {
    return await extractResumeText(fullPath, mimetype);
  } catch (error) {
    console.error("Failed to re-extract resume text for ATS automation:", error.message);
    return null;
  }
};


const evaluateApplicationAts = async ({ application, job, resumeText }) => {
  if (!resumeText || !resumeText.trim()) {
    return { skipped: true, reason: "no_resume_text" };
  }
  const result = scoreResumeAgainstJob(resumeText, job.job_skills || job.skills);
  if (result.score === null) {
    return { skipped: true, reason: "no_job_skills" };
  }
  const threshold = getAtsThreshold();
  const newStatus = result.score >= threshold ? "Shortlisted" : "Rejected";
  const updatedApplication = await applyAtsResult(application.id, {
    status: newStatus,
    atsScore: result.score,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills
  });
  const candidate = await findUserById(application.user_id);
  const jobTitle = job.job_title || job.title || "the role you applied for";
  let assignedAssessments = [];
  if (newStatus === "Shortlisted") {
    try {
      assignedAssessments = await assignPublishedAssessmentsToNewlyShortlistedCandidate(
        job.id || job.job_id,
        application.user_id,
        application.id
      );
    } catch (error) {
      console.error("Auto-assignment after ATS shortlist failed:", error.message);
    }
    const hasAssessment = assignedAssessments.length > 0;
    createNotification(application.user_id, {
      title: "You've Been Shortlisted!",
      message: hasAssessment
        ? `Congratulations! You have been shortlisted for "${jobTitle}". Your assessment is now available.`
        : `Congratulations! You have been shortlisted for "${jobTitle}" (ATS score: ${result.score}%).`,
      type: "success",
      relatedJobId: job.id || job.job_id
    }).catch((err) => console.error("Failed to create shortlist notification:", err.message));
    if (hasAssessment) {
      const company = await getCompanyByRecruiterId(job.recruiter_id).catch(() => null);
      const companyName = (company && company.company_name) || "The recruiter";
      assignedAssessments.forEach((assignment) => {
        createNotification(application.user_id, {
          title: "New Assessment Assigned",
          message: `${companyName} has assigned a new assessment for "${jobTitle}". Check "My Assessments" to get started.`,
          type: "info",
          relatedJobId: job.id || job.job_id
        }).catch((err) => console.error("Failed to create assessment notification:", err.message));
      });
    }
    await sendEmail(
  candidate.email,
  "Congratulations! You have been shortlisted",
  `
  <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">

    <h2>Congratulations!</h2>

    <p>Dear ${candidate.fullname},</p>

    <p>
      We are pleased to inform you that you have been shortlisted for
      <strong>${jobTitle}</strong>.
    </p>

    <p>
      Please log in to SHNOOR Job Portal and complete your technical assessment.
    </p>

    <a href="http://localhost:5173/user/my-assessments"
      style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
      Start Assessment
    </a>

    <br><br>

    Regards,<br>
    <strong>SHNOOR Recruitment Team</strong>

  </div>
  `
);
  } else {
    createNotification(application.user_id, {
      title: "Application Update",
      message: `Unfortunately, your resume did not meet the ATS requirements for this position. (${jobTitle}, ATS score: ${result.score}%)`,
      type: "warning",
      relatedJobId: job.id || job.job_id
    }).catch((err) => console.error("Failed to create rejection notification:", err.message));
    await sendEmail(
  candidate.email,
  "Application Status Update",
  `
  <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">

    <h2>Application Update</h2>

    <p>Dear ${candidate.fullname},</p>

    <p>
      Thank you for applying for
      <strong>${jobTitle}</strong>.
    </p>

    <p>
      After reviewing your application, we regret to inform you that you have not been selected for the next stage of the recruitment process.
    </p>

    <p>
      We appreciate your interest and encourage you to apply for future opportunities.
    </p>

    <br>

    Regards,<br>
    <strong>SHNOOR Recruitment Team</strong>

  </div>
  `
);
  }
  return {
    skipped: false,
    status: newStatus,
    score: result.score,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    assignedAssessments,
    application: updatedApplication
  };
};


const runAtsForNewApplication = async (application, job, resume) => {
  const resumeText = await resolveResumeText(resume);
  return evaluateApplicationAts({ application, job, resumeText });
};


const rerunAtsForPendingApplications = async (userId, resumeText) => {
  const summary = { processed: 0, shortlisted: 0, rejected: 0, skipped: 0 };
  if (!resumeText || !resumeText.trim()) {
    return summary;
  }
  const pending = await getProcessableApplicationsForUser(userId);
  for (const row of pending) {
    const application = { id: row.id, user_id: row.user_id, job_id: row.job_id };
    const job = {
      id: row.job_id,
      job_id: row.job_id,
      job_title: row.job_title,
      job_skills: row.job_skills,
      recruiter_id: row.recruiter_id
    };
    // eslint-disable-next-line no-await-in-loop
    const outcome = await evaluateApplicationAts({ application, job, resumeText });
    if (outcome.skipped) {
      summary.skipped += 1;
      continue;
    }
    summary.processed += 1;
    if (outcome.status === "Shortlisted") summary.shortlisted += 1;
    if (outcome.status === "Rejected") summary.rejected += 1;
  }
  return summary;
};

module.exports = {
  getAtsThreshold,
  resolveResumeText,
  evaluateApplicationAts,
  runAtsForNewApplication,
  rerunAtsForPendingApplications
};
