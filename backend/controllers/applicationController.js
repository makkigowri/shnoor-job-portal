const {
  getApplicationByUserAndJob,applyToJob,withdrawApplication,getApplicationsByUser,getApplicantsForRecruiter,getApplicationForRecruiter,updateApplicationStatus} = require("../models/applicationModel");
const { findJobById } = require("../models/jobModel");
const { getResumeByUserId } = require("../models/resumeModel");
const { createNotification } = require("../models/notificationModel");
const { assignPublishedAssessmentsToNewlyShortlistedCandidate } = require("../models/assessmentAssignmentModel");
const { getCompanyByRecruiterId } = require("../models/companyModel");
const ALLOWED_STATUSES = ["Under Review", "Shortlisted", "Rejected"];
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
      application
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
      } catch (assignError) {
        console.error("Auto-assignment on shortlist failed:", assignError.message);
      }
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
module.exports = {
  applyToJobHandler,withdrawApplicationHandler,listMyApplicationsHandler,listApplicantsHandler,updateApplicationStatusHandler
};