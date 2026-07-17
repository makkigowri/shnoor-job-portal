const technicalInterviewModel = require("../models/technicalInterviewModel");
const technicalInterviewService = require("../services/technicalInterviewService");

const listEligibleHandler = async (req, res, next) => {
  try {
    const applications = await technicalInterviewModel.getEligibleApplicationsForRecruiter(req.user.id);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

const scheduleHandler = async (req, res, next) => {
  try {
    const { applicationId, scheduledDate, scheduledTime, durationMinutes, notes } = req.body;
    if (!applicationId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: "applicationId, scheduledDate and scheduledTime are required"
      });
    }
    const interview = await technicalInterviewService.scheduleAndNotify(req.user.id, {
      applicationId,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      notes
    });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Application not found, not eligible for Technical Interview, or you do not have permission"
      });
    }
    res.status(201).json({ success: true, message: "Technical Interview scheduled successfully", interview });
  } catch (error) {
    next(error);
  }
};

const listRecruiterHandler = async (req, res, next) => {
  try {
    const { status } = req.query;
    const interviews = await technicalInterviewModel.getForRecruiter(req.user.id, { status });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

const listCandidateHandler = async (req, res, next) => {
  try {
    const interviews = await technicalInterviewModel.getForCandidate(req.user.id);
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

const getRoomHandler = async (req, res, next) => {
  try {
    const interview = await technicalInterviewModel.getByRoomCode(req.params.roomCode);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Meeting room not found" });
    }
    const isCandidate = interview.candidate_id === req.user.id;
    const isRecruiter = interview.recruiter_id === req.user.id;
    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ success: false, message: "You are not a participant of this interview" });
    }
    res.status(200).json({
      success: true,
      interview,
      role: isRecruiter ? "recruiter" : "candidate",
      cameraCompulsory: isCandidate,
      microphoneCompulsory: isCandidate
    });
  } catch (error) {
    next(error);
  }
};

const joinHandler = async (req, res, next) => {
  try {
    const interview = await technicalInterviewModel.getByRoomCode(req.params.roomCode);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Meeting room not found" });
    }
    const isCandidate = interview.candidate_id === req.user.id;
    const isRecruiter = interview.recruiter_id === req.user.id;
    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ success: false, message: "You are not a participant of this interview" });
    }
    const updated = await technicalInterviewModel.markJoined(interview.id, isRecruiter ? "recruiter" : "candidate");
    res.status(200).json({ success: true, interview: updated });
  } catch (error) {
    next(error);
  }
};

const endMeetingHandler = async (req, res, next) => {
  try {
    const interview = await technicalInterviewModel.getByRoomCode(req.params.roomCode);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Meeting room not found" });
    }
    const isCandidate = interview.candidate_id === req.user.id;
    const isRecruiter = interview.recruiter_id === req.user.id;
    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ success: false, message: "You are not a participant of this interview" });
    }
    const updated = await technicalInterviewModel.markMeetingEnded(interview.id);
    res.status(200).json({ success: true, interview: updated });
  } catch (error) {
    next(error);
  }
};

const submitResultHandler = async (req, res, next) => {
  try {
    const { result, feedback } = req.body;
    if (!["Selected", "Rejected"].includes(result)) {
      return res.status(400).json({ success: false, message: "Result must be Selected or Rejected" });
    }
    const interview = await technicalInterviewService.recordResultAndNotify(req.params.id, req.user.id, {
      result,
      feedback
    });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Technical Interview not found" });
    }
    res.status(200).json({ success: true, message: `Candidate marked as ${result}`, interview });
  } catch (error) {
    next(error);
  }
};

const getAdminStatsHandler = async (req, res, next) => {
  try {
    const stats = await technicalInterviewModel.getAdminStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEligibleHandler,
  scheduleHandler,
  listRecruiterHandler,
  listCandidateHandler,
  getRoomHandler,
  joinHandler,
  endMeetingHandler,
  submitResultHandler,
  getAdminStatsHandler
};
