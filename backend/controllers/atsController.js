const fs = require("fs");
const extractResumeText = require("../utils/extractResumeText");
const { scoreResumeAgainstJob } = require("../utils/atsScorer");
const { findJobById } = require("../models/jobModel");
const analyzeResume = async (req, res, next) => {
  const filePath = req.file ? req.file.path : null;
  try {
    const { jobId } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a resume file" });
    }
    if (!jobId) {
      return res.status(400).json({ success: false, message: "Please select a job to check against" });
    }
    const job = await findJobById(jobId);
    if (!job || job.recruiter_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const resumeText = await extractResumeText(filePath, req.file.mimetype);
    if (!resumeText || !resumeText.trim()) {
      return res.status(422).json({
        success: false,
        message: "Couldn't read any text from this file. Please try a different resume."
      });
    }
    const result = scoreResumeAgainstJob(resumeText, job.skills);
    res.status(200).json({
      success: true,
      job: { id: job.id, title: job.title },
      fileName: req.file.originalname,
      ...result
    });
  } catch (error) {
    if (error.message && error.message.includes("can't be analyzed")) {
      return res.status(422).json({ success: false, message: error.message });
    }
    if (error.message && error.message.includes("Unsupported file type")) {
      return res.status(422).json({ success: false, message: error.message });
    }
    next(error);
  } finally {
    if (filePath) {
      fs.unlink(filePath, () => {});
    }
  }
};
module.exports = { analyzeResume };
