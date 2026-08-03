const fs = require("fs");
const path = require("path");
const { getProfileByUserId, upsertProfile, updateProfilePhoto, removeProfilePhoto } = require("../models/profileModel");
const { uploadDir } = require("../middleware/upload");
const removeFileIfExists = (photoPath) => {
  if (!photoPath) return;
  const filename = path.basename(photoPath);
  const fullPath = path.join(uploadDir, filename);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to remove old profile photo file:", err.message);
    }
  });
};
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);
    res.status(200).json({
      success: true,
      profile: profile || null,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
const saveMyProfile = async (req, res, next) => {
  try {
    const profile = await upsertProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      profile
    });
  } catch (error) {
    next(error);
  }
};
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No photo file uploaded" });
    }
    const existing = await getProfileByUserId(req.user.id);
    const photoPath = `/uploads/${req.file.filename}`;
    const profile = await updateProfilePhoto(req.user.id, photoPath);

    if (existing && existing.photo_path && existing.photo_path !== photoPath) {
      removeFileIfExists(existing.photo_path);
    }

    res.status(200).json({
      success: true,
      message: "Photo uploaded successfully",
      profile
    });
  } catch (error) {
    next(error);
  }
};
const deleteProfilePhoto = async (req, res, next) => {
  try {
    const existing = await getProfileByUserId(req.user.id);
    if (!existing || !existing.photo_path) {
      return res.status(404).json({ success: false, message: "No profile photo to remove" });
    }

    const profile = await removeProfilePhoto(req.user.id);
    removeFileIfExists(existing.photo_path);

    res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
      profile
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getMyProfile, saveMyProfile, uploadProfilePhoto, deleteProfilePhoto };
