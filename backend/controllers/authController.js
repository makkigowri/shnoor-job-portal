const bcrypt = require("bcrypt");
const {createUser,findUserByEmail,findUserByIdWithPassword,updateUserPassword,deleteUserById} = require("../models/userModel");
const { findAdminByEmail } = require("../models/adminModel");
const generateToken = require("../utils/generateToken");
const SALT_ROUNDS = 10;
const register = async (req, res, next) => {
  try {
    const { fullname, email, phone, password, role } = req.body;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ fullname, email, phone, password: hashedPassword, role });
    const token = generateToken({ id: user.id, role: user.role });
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (role === "admin") {
      const admin = await findAdminByEmail(email.toLowerCase());
      if (!admin) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      const isAdminMatch = await bcrypt.compare(password, admin.password);
      if (!isAdminMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      const token = generateToken({ id: admin.id, role: "admin", type: "admin" });
      const { password: _adminPassword, ...adminWithoutPassword } = admin;
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: { ...adminWithoutPassword, role: "admin" }
      });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: "Your account has been blocked. Please contact support." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (role && role !== user.role) {
      return res.status(401).json({ success: false, message: "Selected role does not match this account" });
    }
    const token = generateToken({ id: user.id, role: user.role });
    const { password: _password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }
    const user = await findUserByIdWithPassword(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateUserPassword(req.user.id, hashedPassword);

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to delete your account" });
    }
    const user = await findUserByIdWithPassword(req.user.id);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }
    await deleteUserById(req.user.id);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = { register, login, getProfile, changePassword, deleteAccount };