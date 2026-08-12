const fs = require("fs");
const path = require("path");
const {
  getResumeByUserId,
  upsertResume,
  clearResume,
  getUserResumes,
  getUserResumeById,
  countUserResumes,
  addUserResume,
  replaceUserResume,
  setDefaultUserResume,
  deleteUserResume,
  promoteMostRecentAsDefault
} = require("../models/resumeModel");
const { uploadDir } = require("../middleware/upload");
const { createNotification } = require("../models/notificationModel");
const extractResumeText = require("../utils/extractResumeText");
const { saveResumeFile, getResumeFile, deleteResumeFile } = require("../models/resumeFileModel");
const persistResumeFile = async (file) => {
  try {
    const buffer = fs.readFileSync(file.path);
    await saveResumeFile(file.filename, buffer, file.mimetype);
  } catch (err) {
    console.error("Failed to persist resume file to database:", err.message);
  }
};
const removeFileIfExists = (resumePath) => {
  if (!resumePath) return;
  const filename = path.basename(resumePath);
  const fullPath = path.join(uploadDir, filename);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to remove old resume file:", err.message);
    }
  });
  deleteResumeFile(filename).catch((err) =>
    console.error("Failed to remove old resume file from database:", err.message)
  );
};
const syncDefaultResumeToProfile = async (userId) => {
  const resumes = await getUserResumes(userId);
  const defaultSummary = resumes.find((resume) => resume.is_default);
  if (!defaultSummary) {
    await clearResume(userId);
    return;
  }
  const fullResume = await getUserResumeById(defaultSummary.id, userId);
  await upsertResume(userId, fullResume.resume_path, fullResume.resume_filename, fullResume.resume_text);
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
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await getUserResumes(req.user.id);
    res.status(200).json({
      success: true,
      resumes,
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
    let resumeText = null;
    try {
      resumeText = await extractResumeText(req.file.path, req.file.mimetype);
    } catch (err) {
      extractionError = err.message;
      console.error("Resume text extraction failed during upload:", err.message);
    }
    await persistResumeFile(req.file);
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
const uploadAdditionalResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }
    const resumePath = `/uploads/${req.file.filename}`;
    const resumeName = (req.body.resumeName && req.body.resumeName.trim()) || req.file.originalname;
    let resumeText = null;
    let extractionError = null;
    try {
      resumeText = await extractResumeText(req.file.path, req.file.mimetype);
    } catch (err) {
      extractionError = err.message;
      console.error("Resume text extraction failed during upload:", err.message);
    }
    await persistResumeFile(req.file);
    const existingCount = await countUserResumes(req.user.id);
    const isDefault = existingCount === 0;
    const resume = await addUserResume(req.user.id, {
      resumeName,
      resumePath,
      resumeFilename: req.file.originalname,
      resumeText,
      isDefault
    });
    if (isDefault) {
      await syncDefaultResumeToProfile(req.user.id);
    }
    createNotification(req.user.id, {
      title: "Resume Uploaded",
      message: `Your resume "${resumeName}" has been uploaded successfully.`,
      type: "info"
    }).catch((err) => console.error("Failed to create notification:", err.message));
    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume,
      atsAutomation: {
        textExtracted: Boolean(resumeText && resumeText.trim()),
        extractionError
      }
    });
  } catch (error) {
    next(error);
  }
};
const replaceResume = async (req, res, next) => {
  try {
    const existing = await getUserResumeById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }
    const resumePath = `/uploads/${req.file.filename}`;
    let resumeText = null;
    let extractionError = null;
    try {
      resumeText = await extractResumeText(req.file.path, req.file.mimetype);
    } catch (err) {
      extractionError = err.message;
      console.error("Resume text extraction failed during replace:", err.message);
    }
    await persistResumeFile(req.file);
    const resume = await replaceUserResume(req.params.id, req.user.id, {
      resumePath,
      resumeFilename: req.file.originalname,
      resumeText
    });
    removeFileIfExists(existing.resume_path);
    if (resume.is_default) {
      await syncDefaultResumeToProfile(req.user.id);
    }
    res.status(200).json({
      success: true,
      message: "Resume replaced successfully",
      resume,
      atsAutomation: {
        textExtracted: Boolean(resumeText && resumeText.trim()),
        extractionError
      }
    });
  } catch (error) {
    next(error);
  }
};
const setDefaultResume = async (req, res, next) => {
  try {
    const existing = await getUserResumeById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    const resume = await setDefaultUserResume(req.params.id, req.user.id);
    await syncDefaultResumeToProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: "Default resume updated",
      resume
    });
  } catch (error) {
    next(error);
  }
};
const downloadResume = async (req, res, next) => {
  try {
    const existing = await getUserResumeById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const filename = path.basename(existing.resume_path);
    const fullPath = path.join(uploadDir, filename);
    if (fs.existsSync(fullPath)) {
      return res.download(fullPath, existing.resume_filename);
    }
    const persisted = await getResumeFile(filename);
    if (!persisted) {
      return res.status(404).json({ success: false, message: "Resume file not found on server" });
    }
    res.setHeader("Content-Type", persisted.mimetype || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${existing.resume_filename.replace(/"/g, "")}"`
    );
    res.send(persisted.data);
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
const deleteAdditionalResume = async (req, res, next) => {
  try {
    const resume = await deleteUserResume(
      req.params.id,
      req.user.id
    );
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }
    removeFileIfExists(resume.resume_path);
    if (resume.is_default) {
      await promoteMostRecentAsDefault(req.user.id);
    }
    await syncDefaultResumeToProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getMyResume,
  getMyResumes,
  uploadMyResume,
  uploadAdditionalResume,
  replaceResume,
  setDefaultResume,
  downloadResume,
  deleteMyResume,
  deleteAdditionalResume,
};