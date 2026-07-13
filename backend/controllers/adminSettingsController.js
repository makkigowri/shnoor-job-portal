const bcrypt = require("bcrypt");
const { getSettings, updateSettings, updateSettingsLogo } = require("../models/adminSettingsModel");
const { findAdminByIdWithPassword, updateAdminPassword } = require("../models/adminModel");
const SALT_ROUNDS = 10;

const getAppSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.status(200).json({ success: true, settings: settings || null });
  } catch (error) {
    next(error);
  }
};

const saveAppSettings = async (req, res, next) => {
  try {
    const { applicationName, supportEmail, theme } = req.body;
    if (theme && !["light", "dark"].includes(theme)) {
      return res.status(400).json({ success: false, message: "Theme must be light or dark" });
    }
    const settings = await updateSettings({ applicationName, supportEmail, theme });
    res.status(200).json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    next(error);
  }
};

const uploadAppLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file uploaded" });
    }
    const logoPath = `/uploads/${req.file.filename}`;
    const settings = await updateSettingsLogo(logoPath);
    res.status(200).json({ success: true, message: "Logo updated successfully", settings });
  } catch (error) {
    next(error);
  }
};

const changeAdminSettingsPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }
    const admin = await findAdminByIdWithPassword(req.admin.id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateAdminPassword(req.admin.id, hashedPassword);
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppSettings, saveAppSettings, uploadAppLogo, changeAdminSettingsPassword };
