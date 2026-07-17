const aiInterviewModel = require("../models/aiInterviewModel");
const aiInterviewService = require("../services/aiInterviewService");
const listMyInterviewsHandler = async (req, res, next) => {
  try {
    const interviews = await aiInterviewModel.getInterviewsForCandidate(req.user.id);
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};
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
const listRecruiterInterviewsHandler = async (req, res, next) => {
  try {
    const { status } = req.query;
    const interviews = await aiInterviewModel.getInterviewsForRecruiter(req.user.id, { status });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};
const getAdminStatsHandler = async (req, res, next) => {
  try {
    const stats = await aiInterviewModel.getAiInterviewAdminStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};
const reportViolationHandler = async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!["tab", "fullscreen"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be 'tab' or 'fullscreen'" });
    }
    const result = await aiInterviewService.recordViolation(req.params.interviewId, req.user.id, type);
    if (result.error === "not_found") {
      return res.status(404).json({ success: false, message: "AI interview not found" });
    }
    if (result.error === "not_in_progress") {
      return res.status(400).json({ success: false, message: "AI interview is not in progress" });
    }
    res.status(200).json({
      success: true,
      count: result.count,
      autoSubmitted: result.autoSubmitted,
      interview: result.interview
    });
  } catch (error) {
    next(error);
  }
};
const autoSubmitHandler = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const result = await aiInterviewService.forceSubmitInterview(req.params.interviewId, req.user.id, reason);
    if (result.error === "not_found") {
      return res.status(404).json({ success: false, message: "AI interview not found" });
    }
    if (result.error === "not_in_progress") {
      return res.status(400).json({ success: false, message: "AI interview is not in progress" });
    }
    res.status(200).json({ success: true, interview: result.interview });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  listMyInterviewsHandler,getByApplicationHandler,getInterviewHandler,startInterviewHandler,submitAnswerHandler,reportViolationHandler,autoSubmitHandler,getInterviewForRecruiterHandler,listRecruiterInterviewsHandler,getAdminStatsHandler
};
