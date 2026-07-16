const fs = require("fs");
const path = require("path");
const { getResumeByUserId, upsertResume, clearResume } = require("../models/resumeModel");
const { uploadDir } = require("../middleware/upload");
const { createNotification } = require("../models/notificationModel");
const extractResumeText = require("../utils/extractResumeText");
const removeFileIfExists = (resumePath) => {
  if (!resumePath) return;
  const filename = path.basename(resumePath);
  const fullPath = path.join(uploadDir, filename);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to remove old resume file:", err.message);
    }
  });
};
const getMyResume = async (req, res, next) => {
  try {
    const resume = await getResumeByUserId(req.user.id);
    const safeResume = resume && resume.resume_path ? { ...resume, resume_text: undefined } : null;
    res.status(200).json({
      success: true,
      resume: safeResume
    });
  } catch (error) {
    next(error);
  }
};
const uploadMyResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }
    const existing = await getResumeByUserId(req.user.id);
    const resumePath = `/uploads/${req.file.filename}`;
    let extractionError = null;
    try {
      resumeText = await extractResumeText(req.file.path, req.file.mimetype);
    } catch (err) {
      extractionError = err.message;
      console.error("Resume text extraction failed during upload:", err.message);
    }
    const resume = await upsertResume(req.user.id, resumePath, req.file.originalname, resumeText);

    if (existing && existing.resume_path && existing.resume_path !== resumePath) {
      removeFileIfExists(existing.resume_path);
    }
    createNotification(req.user.id, {
      title: "Resume Uploaded",
      message: `Your resume "${req.file.originalname}" has been uploaded successfully.`,
      type: "info"
    }).catch((err) => console.error("Failed to create notification:", err.message));
    const { resume_text, ...resumeForClient } = resume;
    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: resumeForClient,
      atsAutomation: {
        processed: 0,
        shortlisted: 0,
        rejected: 0,
        skipped: 0,
        textExtracted: Boolean(resumeText && resumeText.trim()),
        extractionError
      }
    });
  } catch (error) {
    next(error);
  }
};
const deleteMyResume = async (req, res, next) => {
  try {
    const existing = await getResumeByUserId(req.user.id);
    if (!existing || !existing.resume_path) {
      return res.status(404).json({ success: false, message: "No resume found to delete" });
    }
    await clearResume(req.user.id);
    removeFileIfExists(existing.resume_path);
    res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getMyResume, uploadMyResume, deleteMyResume };
