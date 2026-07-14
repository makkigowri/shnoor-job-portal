const {
  assignAssessmentToCandidates,
  removeAssignment,
  getAssignedCandidates,
  getPendingAssessmentsForCandidate,
  getUpcomingAssessmentsForCandidate,
  getCompletedAssessmentsForCandidate,
  expireOverdueAssignments
} = require("../models/assessmentAssignmentModel");
const { createNotification } = require("../models/notificationModel");
const assignAssessmentHandler = async (req, res, next) => {
  try {
    const { candidateIds, scheduledStart, scheduledEnd } = req.body;
    const { assessment, assigned, skipped } = await assignAssessmentToCandidates(
      req.params.assessmentId,
      req.user.id,
      candidateIds,
      { scheduledStart, scheduledEnd }
    );
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found or you do not have permission to assign it" });
    }
    assigned.forEach((assignment) => {
      createNotification(assignment.candidate_id, {
        title: "New Assessment Assigned",
        message: "You have been assigned a new assessment. Please check your assessments dashboard.",
        type: "info"
      }).catch((err) => console.error("Failed to create notification:", err.message));
    });
    res.status(201).json({
      success: true,
      message: `Assessment assigned to ${assigned.length} candidate(s)${skipped.length ? `, ${skipped.length} skipped (not shortlisted)` : ""}`,
      assigned,
      skipped
    });
  } catch (error) {
    next(error);
  }
};
const removeAssignmentHandler = async (req, res, next) => {
  try {
    const removed = await removeAssignment(req.params.id, req.user.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Assignment not found or it can no longer be removed" });
    }
    res.status(200).json({ success: true, message: "Assignment removed successfully" });
  } catch (error) {
    next(error);
  }
};
const getAssignedCandidatesHandler = async (req, res, next) => {
  try {
    const candidates = await getAssignedCandidates(req.params.assessmentId, req.user.id);
    res.status(200).json({ success: true, candidates });
  } catch (error) {
    next(error);
  }
};
const getPendingAssessmentsHandler = async (req, res, next) => {
  try {
    await expireOverdueAssignments(req.user.id);
    const assessments = await getPendingAssessmentsForCandidate(req.user.id);
    res.status(200).json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
};
const getUpcomingAssessmentsHandler = async (req, res, next) => {
  try {
    const assessments = await getUpcomingAssessmentsForCandidate(req.user.id);
    res.status(200).json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
};
const getCompletedAssessmentsHandler = async (req, res, next) => {
  try {
    const assessments = await getCompletedAssessmentsForCandidate(req.user.id);
    res.status(200).json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  assignAssessmentHandler,
  removeAssignmentHandler,
  getAssignedCandidatesHandler,
  getPendingAssessmentsHandler,
  getUpcomingAssessmentsHandler,
  getCompletedAssessmentsHandler
};
