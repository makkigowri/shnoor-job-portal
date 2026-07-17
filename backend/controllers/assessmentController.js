const {
  createAssessment,updateAssessment,deleteAssessment,getAssessmentById,getAssessmentsByRecruiter,setAssessmentStatus,getQuestionCount} = require("../models/assessmentModel");
const { autoAssignShortlistedCandidates } = require("../models/assessmentAssignmentModel");
const { createNotification } = require("../models/notificationModel");
const { getCompanyByRecruiterId } = require("../models/companyModel");
const createAssessmentHandler = async (req, res, next) => {
  try {
    const assessment = await createAssessment(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      assessment
    });
  } catch (error) {
    next(error);
  }
};
const updateAssessmentHandler = async (req, res, next) => {
  try {
    const assessment = await updateAssessment(req.params.id, req.user.id, req.body);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found or you do not have permission to edit it" });
    }
    res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      assessment
    });
  } catch (error) {
    next(error);
  }
};
const deleteAssessmentHandler = async (req, res, next) => {
  try {
    const deleted = await deleteAssessment(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Assessment not found or you do not have permission to delete it" });
    }
    res.status(200).json({ success: true, message: "Assessment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
const getAssessmentHandler = async (req, res, next) => {
  try {
    const assessment = await getAssessmentById(req.params.id, req.user.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};
const getAllAssessmentsHandler = async (req, res, next) => {
  try {
    const { status, jobId } = req.query;
    const assessments = await getAssessmentsByRecruiter(req.user.id, { status, jobId });
    res.status(200).json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
};
const publishAssessmentHandler = async (req, res, next) => {
  try {
    const questionCount = await getQuestionCount(req.params.id);
    if (questionCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish an assessment with no questions"
      });
    }
    const updated = await setAssessmentStatus(req.params.id, req.user.id, "Published");
    if (!updated) {
      return res.status(404).json({ success: false, message: "Assessment not found or you do not have permission to publish it" });
    }
    const assessment = await getAssessmentById(req.params.id, req.user.id);
    let assignedCount = 0;
    let notLinkedToJob = false;
    try {
      const { assigned } = await autoAssignShortlistedCandidates(req.params.id, req.user.id);
      assignedCount = assigned.length;
      notLinkedToJob = !assessment.job_id;
      if (assigned.length > 0) {
        const company = await getCompanyByRecruiterId(req.user.id).catch(() => null);
        const companyName = (company && company.company_name) || "The recruiter";
        const jobTitle = assessment.job_title || "the role you applied for";
        assigned.forEach((assignment) => {
          createNotification(assignment.candidate_id, {
            title: "New Assessment Assigned",
            message: `${companyName} has assigned a new assessment for ${jobTitle}. Check "My Assessments" to get started.`,
            type: "info",
            relatedJobId: assessment.job_id || null
          }).catch((err) => console.error("Failed to create assessment notification:", err.message));
        });
      }
    } catch (assignError) {
      console.error("Auto-assignment after publish failed:", assignError.message);
    }

    res.status(200).json({
      success: true,
      message: notLinkedToJob
        ? "Assessment published successfully. It is not linked to a job, so no candidates were auto-assigned - use the Assign page to add candidates manually."
        : `Assessment published successfully. Automatically assigned to ${assignedCount} shortlisted candidate(s).`,
      assessment,
      assignedCount
    });
  } catch (error) {
    next(error);
  }
};
const closeAssessmentHandler = async (req, res, next) => {
  try {
    const assessment = await setAssessmentStatus(req.params.id, req.user.id, "Closed");
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found or you do not have permission to close it" });
    }
    res.status(200).json({ success: true, message: "Assessment closed successfully", assessment });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createAssessmentHandler,updateAssessmentHandler,deleteAssessmentHandler,getAssessmentHandler,getAllAssessmentsHandler,publishAssessmentHandler,closeAssessmentHandler
};
