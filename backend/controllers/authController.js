const bcrypt = require("bcrypt");
const {createUser,findUserByEmail,findUserByIdWithPassword,updateUserPassword,deleteUserById} = require("../models/userModel");
const { findAdminByEmail } = require("../models/adminModel");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../services/emailService");
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
    await sendEmail(
  user.email,
  "Welcome to SHNOOR Job Portal",
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e5e5; border-radius: 8px;">
    <h2 style="color:#2c3e50;">Welcome to SHNOOR Job Portal</h2>
    <p>Dear ${user.fullname},</p>
    <p>
      Thank you for registering with <strong>SHNOOR Job Portal</strong>.
      Your account has been created successfully.
    </p>
    <p>You can now:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Upload your resume</li>
      <li>Search for suitable job opportunities</li>
      <li>Apply for jobs and track your applications</li>
    </ul>
    <p>
      Click the button below to log in to your account.
    </p>
    <a href="http://localhost:5173/login"
       style="
         display:inline-block;
         padding:12px 24px;
         background:#4F46E5;
         color:#ffffff;
         text-decoration:none;
         border-radius:6px;
         font-weight:600;
       ">
       Login to SHNOOR
    </a>
    <br><br>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>
      Regards,<br>
      <strong>SHNOOR Recruitment Team</strong>
    </p>
  </div>
  `
);
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
    const { email, password } = req.body;
    const admin = await findAdminByEmail(email.toLowerCase());
    if (admin) {
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