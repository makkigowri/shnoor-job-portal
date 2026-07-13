const jwt = require("jsonwebtoken");
const { findAdminById } = require("../models/adminModel");

// Separate from the user-facing `protect` middleware in authMiddleware.js.
// Tokens issued for admins carry `type: "admin"` and are validated against
// the `admins` table only, so a jobseeker/recruiter token can never be used
// here and vice versa.
const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized as admin" });
    }
    const admin = await findAdminById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin no longer exists" });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
  }
};

module.exports = { protectAdmin };
