const { saveJob, removeSavedJob, getSavedJobsByUser } = require("../models/savedJobModel");
const { findJobById } = require("../models/jobModel");
const saveJobHandler = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await findJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const saved = await saveJob(req.user.id, jobId);
    res.status(200).json({
      success: true,
      message: saved ? "Job saved successfully" : "Job is already in your saved list",
      saved: saved || true
    });
  } catch (error) {
    next(error);
  }
};
const removeSavedJobHandler = async (req, res, next) => {
  try {
    const removed = await removeSavedJob(req.user.id, req.params.jobId);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Saved job not found" });
    }
    res.status(200).json({
      success: true,
      message: "Job removed from saved list"
    });
  } catch (error) {
    next(error);
  }
};
const listSavedJobsHandler = async (req, res, next) => {
  try {
    const jobs = await getSavedJobsByUser(req.user.id);
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};
module.exports = { saveJobHandler, removeSavedJobHandler, listSavedJobsHandler };