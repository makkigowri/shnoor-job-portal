const {createJob,updateJob,deleteJob,findJobById,findJobsByRecruiter,searchJobs} = require("../models/jobModel");
const postJob = async (req, res, next) => {
  try {
    const { title, location } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Job title is required" });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: "Job location is required" });
    }
    const job = await createJob(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job
    });
  } catch (error) {
    next(error);
  }
};
const editJob = async (req, res, next) => {
  try {
    const job = await updateJob(req.params.id, req.user.id, req.body);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or you do not have permission to edit it" });
    }
    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job
    });
  } catch (error) {
    next(error);
  }
};
const removeJob = async (req, res, next) => {
  try {
    const deleted = await deleteJob(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Job not found or you do not have permission to delete it" });
    }
    res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
const getJob = async (req, res, next) => {
  try {
    const job = await findJobById(req.params.id, req.user.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await findJobsByRecruiter(req.user.id);
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};
const searchJobsHandler = async (req, res, next) => {
  try {
    const { title, location, experience, employmentType, salaryMin, salaryMax, page, limit } = req.query;
    const result = await searchJobs(
      {
        title,
        location: location && location !== "Location" ? location : undefined,
        experience: experience && experience !== "Experience" ? experience : undefined,
        employmentType: employmentType && employmentType !== "Job Type" ? employmentType : undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10
      },
      req.user.id
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
module.exports = {postJob,editJob,removeJob,getJob,getMyJobs,searchJobsHandler};