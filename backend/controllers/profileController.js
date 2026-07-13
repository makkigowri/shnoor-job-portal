const { getProfileByUserId, upsertProfile, updateProfilePhoto } = require("../models/profileModel");
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
    const photoPath = `/uploads/${req.file.filename}`;
    const profile = await updateProfilePhoto(req.user.id, photoPath);
    res.status(200).json({
      success: true,
      message: "Photo uploaded successfully",
      profile
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getMyProfile, saveMyProfile, uploadProfilePhoto };
