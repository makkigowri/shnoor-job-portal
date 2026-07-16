const aiInterviewModel = require("../models/aiInterviewModel");
const aiInterviewService = require("../services/aiInterviewService");

/**
 * GET /api/ai-interview/my
 * Lists all AI interview sessions (Available / In Progress / Completed) for the
 * logged-in candidate. Used by the User Dashboard to show "Start AI Interview".
 */
const listMyInterviewsHandler = async (req, res, next) => {
  try {
    const interviews = await aiInterviewModel.getInterviewsForCandidate(req.user.id);
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai-interview/by-application/:applicationId
 * Convenience lookup so pages like "Assessment Result" can find the matching
 * AI interview session for a given job application.
 */
const getByApplicationHandler = async (req, res, next) => {
  try {
    const interview = await aiInterviewModel.getInterviewByApplicationForCandidate(
      req.params.applicationId,
      req.user.id
    );
    if (!interview) {
      return res.status(404).json({ success: false, message: "No AI interview found for this application yet" });
    }
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai-interview/:interviewId
 * Full detail (including transcript) for the candidate.
 */
const getInterviewHandler = async (req, res, next) => {
  try {
    const interview = await aiInterviewModel.getInterviewForCandidate(req.params.interviewId, req.user.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "AI interview not found" });
    }
    const questions = await aiInterviewModel.getQuestionsForInterview(req.params.interviewId);
    res.status(200).json({ success: true, interview, questions });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai-interview/:interviewId/start
 * Begins the interview and returns the first (or next unanswered) question,
 * generated dynamically by Ollama.
 */
const startInterviewHandler = async (req, res, next) => {
  try {
    const result = await aiInterviewService.startInterview(req.params.interviewId, req.user.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "AI interview not found, not available, or already completed"
      });
    }
    res.status(200).json({
      success: true,
      message: "Interview started",
      interview: result.interview,
      question: result.question,
      totalQuestions: result.interview.total_questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai-interview/:interviewId/answer
 * Body: { questionId, answerText }
 * Saves the candidate's speech-to-text answer and returns either the next
 * dynamically generated question, or the final evaluation if the interview
 * is now complete.
 */
const submitAnswerHandler = async (req, res, next) => {
  try {
    const { questionId, answerText } = req.body;
    if (!questionId || typeof answerText !== "string") {
      return res.status(400).json({ success: false, message: "questionId and answerText are required" });
    }
    const result = await aiInterviewService.submitAnswerAndAdvance(
      req.params.interviewId,
      req.user.id,
      questionId,
      answerText
    );
    if (result.error === "not_found") {
      return res.status(404).json({ success: false, message: "AI interview not found" });
    }
    if (result.error === "already_completed") {
      return res.status(400).json({
        success: false,
        message: "This AI interview has already been completed",
        interview: result.interview
      });
    }
    res.status(200).json({
      success: true,
      isComplete: result.isComplete,
      interview: result.interview,
      question: result.isComplete ? null : result.question,
      questions: result.isComplete ? result.questions : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai-interview/recruiter/:interviewId
 * Read-only recruiter view of a completed (or in-progress) AI interview,
 * including the full transcript and AI evaluation. Additive endpoint only -
 * does not alter any existing recruiter workflow or files.
 */
const getInterviewForRecruiterHandler = async (req, res, next) => {
  try {
    const interview = await aiInterviewModel.getInterviewDetailForRecruiter(req.params.interviewId, req.user.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "AI interview not found" });
    }
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai-interview/recruiter
 * Lists ALL AI interview sessions (any status) across the logged-in recruiter's
 * jobs, for the Recruiter Panel "AI Interviews" screen (AI Score, AI Status,
 * Feedback, Current Stage). Additive, read-only - does not touch ATS/Applicants
 * or Assessment endpoints.
 */
const listRecruiterInterviewsHandler = async (req, res, next) => {
  try {
    const { status } = req.query;
    const interviews = await aiInterviewModel.getInterviewsForRecruiter(req.user.id, { status });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai-interview/admin/stats
 * Aggregate AI Interview statistics for the Admin Panel monitoring widget.
 * Protected by protectAdmin (separate admin auth), additive and read-only.
 */
const getAdminStatsHandler = async (req, res, next) => {
  try {
    const stats = await aiInterviewModel.getAiInterviewAdminStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyInterviewsHandler,
  getByApplicationHandler,
  getInterviewHandler,
  startInterviewHandler,
  submitAnswerHandler,
  getInterviewForRecruiterHandler,
  listRecruiterInterviewsHandler,
  getAdminStatsHandler
};
