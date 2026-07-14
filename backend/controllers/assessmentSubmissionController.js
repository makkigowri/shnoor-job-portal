const {
  startAssessment,
  getSubmissionForCandidate,
  getQuestionsForSubmission,
  saveAnswers,
  scoreAndFinalizeSubmission,
  getResultsForAssessment,
  getSubmissionDetailForRecruiter,
  getSubmissionDetailForCandidate
} = require("../models/assessmentSubmissionModel");
const { createNotification } = require("../models/notificationModel");
const START_ERROR_MESSAGES = {
  not_found: "Assessment assignment not found",
  not_published: "This assessment is not currently available",
  not_started_yet: "This assessment window has not started yet",
  expired: "This assessment window has expired",
  already_completed: "You have already completed this assessment"
};
const startAssessmentHandler = async (req, res, next) => {
  try {
    const { submission, error } = await startAssessment(req.params.assignmentId, req.user.id);
    if (error) {
      return res.status(error === "not_found" ? 404 : 400).json({
        success: false,
        message: START_ERROR_MESSAGES[error] || "Unable to start assessment"
      });
    }
    const questions = await getQuestionsForSubmission(submission.assessment_id);
    res.status(200).json({
      success: true,
      message: "Assessment started",
      submission,
      questions
    });
  } catch (error) {
    next(error);
  }
};
const saveAnswersHandler = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const result = await saveAnswers(req.params.submissionId, req.user.id, answers);
    if (!result) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    if (result.locked) {
      return res.status(400).json({ success: false, message: "This assessment has already been submitted" });
    }
    res.status(200).json({ success: true, message: "Answers saved", answers: result.answers });
  } catch (error) {
    next(error);
  }
};
const submitAssessmentHandler = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const { submission, error } = await scoreAndFinalizeSubmission(req.params.submissionId, req.user.id, {
      answers,
      autoSubmit: false
    });
    if (error === "not_found") {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    if (error === "already_submitted") {
      return res.status(400).json({ success: false, message: "This assessment has already been submitted", submission });
    }
    createNotification(req.user.id, {
      title: "Assessment Submitted",
      message: `You scored ${submission.total_score}/${submission.max_score} (${submission.result}).`,
      type: submission.result === "Pass" ? "success" : "warning"
    }).catch((err) => console.error("Failed to create notification:", err.message));
    res.status(200).json({ success: true, message: "Assessment submitted successfully", submission });
  } catch (error) {
    next(error);
  }
};
const autoSubmitAssessmentHandler = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const { submission, error } = await scoreAndFinalizeSubmission(req.params.submissionId, req.user.id, {
      answers,
      autoSubmit: true
    });
    if (error === "not_found") {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    if (error === "already_submitted") {
      return res.status(200).json({ success: true, message: "Assessment was already submitted", submission });
    }
    createNotification(req.user.id, {
      title: "Assessment Auto Submitted",
      message: `Time expired. Your assessment was auto submitted with a score of ${submission.total_score}/${submission.max_score}.`,
      type: "warning"
    }).catch((err) => console.error("Failed to create notification:", err.message));
    res.status(200).json({ success: true, message: "Assessment auto submitted", submission });
  } catch (error) {
    next(error);
  }
};
const getMySubmissionHandler = async (req, res, next) => {
  try {
    const submission = await getSubmissionDetailForCandidate(req.params.submissionId, req.user.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    res.status(200).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};
const getResultsHandler = async (req, res, next) => {
  try {
    const results = await getResultsForAssessment(req.params.assessmentId, req.user.id);
    if (results === null) {
      return res.status(404).json({ success: false, message: "Assessment not found or you do not have permission to view results" });
    }
    res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};
const getSubmissionDetailHandler = async (req, res, next) => {
  try {
    const submission = await getSubmissionDetailForRecruiter(req.params.submissionId, req.user.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    res.status(200).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  startAssessmentHandler,
  saveAnswersHandler,
  submitAssessmentHandler,
  autoSubmitAssessmentHandler,
  getMySubmissionHandler,
  getResultsHandler,
  getSubmissionDetailHandler
};
