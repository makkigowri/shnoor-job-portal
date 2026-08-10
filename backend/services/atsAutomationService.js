const { scoreSkillsOnly } = require("../utils/atsScorer");
const { createNotification } = require("../models/notificationModel");
const { getCompanyByRecruiterId } = require("../models/companyModel");
const { sendEmail } = require("./emailService");
const { findUserById } = require("../models/userModel");
const { getProfileByUserId } = require("../models/profileModel");
const {
  applyAtsResult,
  getProcessableApplicationsForUser,
  getAppliedApplicantsForJob
} = require("../models/applicationModel");
const {
  assignPublishedAssessmentsToNewlyShortlistedCandidate
} = require("../models/assessmentAssignmentModel");
const getAtsThreshold = () => {
  const configured = Number(process.env.ATS_AUTO_SHORTLIST_THRESHOLD);
  return Number.isFinite(configured) && configured > 0 ? configured : 80;
};
// ATS scoring compares ONLY the candidate's profile Skills against the
// job's Required Skills. Qualification, experience, resume text, and any
// other fields are intentionally never used in this calculation.
const evaluateApplicationAts = async ({ application, job, candidateSkills }) => {
  const result = scoreSkillsOnly(candidateSkills, job.job_skills || job.skills);
  if (result.score === null) {
    return { skipped: true, reason: "no_job_skills" };
  }
  const jobThreshold = job.job_ats_threshold ?? job.ats_threshold;
  const threshold = Number.isFinite(Number(jobThreshold)) && Number(jobThreshold) > 0 ? Number(jobThreshold) : getAtsThreshold();
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
const runAtsForNewApplication = async (application, job) => {
  const profile = await getProfileByUserId(application.user_id);
  const candidateSkills = profile ? profile.skills : null;
  return evaluateApplicationAts({ application, job, candidateSkills });
};
const rerunAtsForPendingApplications = async (userId) => {
  const summary = { processed: 0, shortlisted: 0, rejected: 0, skipped: 0 };
  const profile = await getProfileByUserId(userId);
  const candidateSkills = profile ? profile.skills : null;
  const pending = await getProcessableApplicationsForUser(userId);
  for (const row of pending) {
    const application = { id: row.id, user_id: row.user_id, job_id: row.job_id };
    const job = {
      id: row.job_id,
      job_id: row.job_id,
      job_title: row.job_title,
      job_skills: row.job_skills,
      job_ats_threshold: row.job_ats_threshold,
      recruiter_id: row.recruiter_id
    };
    const outcome = await evaluateApplicationAts({ application, job, candidateSkills });
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
const runAtsForJobApplicants = async (recruiterId, jobId) => {
  const summary = { processed: 0, shortlisted: 0, rejected: 0, skipped: 0 };
  const pending = await getAppliedApplicantsForJob(recruiterId, jobId);
  for (const row of pending) {
    const application = { id: row.id, user_id: row.user_id, job_id: row.job_id };
    const job = {
      id: row.job_id,
      job_id: row.job_id,
      job_title: row.job_title,
      job_skills: row.job_skills,
      job_ats_threshold: row.job_ats_threshold,
      recruiter_id: row.recruiter_id
    };
    const outcome = await evaluateApplicationAts({ application, job, candidateSkills: row.candidate_skills });
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
  evaluateApplicationAts,
  runAtsForNewApplication,
  rerunAtsForPendingApplications,
  runAtsForJobApplicants
};
