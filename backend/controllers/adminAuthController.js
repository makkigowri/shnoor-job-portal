const bcrypt = require("bcrypt");
const { findAdminByEmail, findAdminByIdWithPassword, updateAdminPassword } = require("../models/adminModel");
const generateToken = require("../utils/generateToken");
const SALT_ROUNDS = 10;

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const admin = await findAdminByEmail(email.toLowerCase());
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = generateToken({ id: admin.id, type: "admin" });
    const { password: _password, ...adminWithoutPassword } = admin;
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, admin: req.admin });
  } catch (error) {
    next(error);
  }
};

const changeAdminPassword = async (req, res, next) => {
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

module.exports = { adminLogin, getAdminProfile, changeAdminPassword };
