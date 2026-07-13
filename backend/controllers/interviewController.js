const { scheduleInterview,getInterviewsByRecruiter,getInterviewsByCandidate,rescheduleInterview,updateInterviewStatus} = require("../models/interviewModel");
const { findJobById } = require("../models/jobModel");
const { createNotification } = require("../models/notificationModel");
const scheduleInterviewHandler = async (req, res, next) => {
  try {
    const { applicationId, scheduledDate, scheduledTime, mode, locationOrLink, notes } = req.body;
    if (!applicationId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: "applicationId, scheduledDate and scheduledTime are required"
      });
    }
    const interview = await scheduleInterview(req.user.id, {
      applicationId,
      scheduledDate,
      scheduledTime,
      mode,
      locationOrLink,
      notes
    });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Application not found or you do not have permission to schedule this interview"
      });
    }
    const job = await findJobById(interview.job_id);
    createNotification(interview.candidate_id, {
      title: "Interview Scheduled",
      message: `Your interview for "${job ? job.title : "a job"}" is scheduled on ${scheduledDate} at ${scheduledTime}.`,
      type: "success",
      relatedJobId: interview.job_id
    }).catch((err) => console.error("Failed to create notification:", err.message));
    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview
    });
  } catch (error) {
    next(error);
  }
};
const listInterviewsHandler = async (req, res, next) => {
  try {
    const { status } = req.query;
    const interviews = await getInterviewsByRecruiter(req.user.id, { status });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};
const listMyInterviewsHandler = async (req, res, next) => {
  try {
    const interviews = await getInterviewsByCandidate(req.user.id);
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};
const rescheduleInterviewHandler = async (req, res, next) => {
  try {
    const { scheduledDate, scheduledTime, mode, locationOrLink, notes } = req.body;
    const interview = await rescheduleInterview(req.params.id, req.user.id, {
      scheduledDate,
      scheduledTime,
      mode,
      locationOrLink,
      notes
    });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    const job = await findJobById(interview.job_id);
    createNotification(interview.candidate_id, {
      title: "Interview Rescheduled",
      message: `Your interview for "${job ? job.title : "a job"}" has been rescheduled to ${interview.scheduled_date instanceof Date ? interview.scheduled_date.toISOString().slice(0, 10) : interview.scheduled_date} at ${interview.scheduled_time}.`,
      type: "warning",
      relatedJobId: interview.job_id
    }).catch((err) => console.error("Failed to create notification:", err.message));
    res.status(200).json({ success: true, message: "Interview rescheduled successfully", interview });
  } catch (error) {
    next(error);
  }
};
const updateInterviewStatusHandler = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Completed or Cancelled" });
    }
    const interview = await updateInterviewStatus(req.params.id, req.user.id, status);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    const job = await findJobById(interview.job_id);
    if (status === "Cancelled") {
      createNotification(interview.candidate_id, {
        title: "Interview Cancelled",
        message: `Your interview for "${job ? job.title : "a job"}" has been cancelled.`,
        type: "error",
        relatedJobId: interview.job_id
      }).catch((err) => console.error("Failed to create notification:", err.message));
    }
    res.status(200).json({ success: true, message: `Interview marked as ${status}`, interview });
  } catch (error) {
    next(error);
  }
};
module.exports = {scheduleInterviewHandler,listInterviewsHandler,listMyInterviewsHandler,rescheduleInterviewHandler,updateInterviewStatusHandler};
