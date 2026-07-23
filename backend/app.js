const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const profileRoutes = require("./routes/profileRoutes");
const companyRoutes = require("./routes/companyRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const aiInterviewRoutes = require("./routes/aiInterviewRoutes");
const meetingRoutes = require("./routes/meetingRoutes"); 
const atsRoutes = require("./routes/atsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assessmentAssignmentRoutes = require("./routes/assessmentAssignmentRoutes");
const assessmentSubmissionRoutes = require("./routes/assessmentSubmissionRoutes");
const searchRoutes = require("./routes/searchRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { sendEmail } = require("./services/emailService");
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.get("/api/health", (req, res) => {res.status(200).json({ success: true, message: "Shnoor Job Portal API is running" });});
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assessment-assignments", assessmentAssignmentRoutes);
app.use("/api/assessment-submissions", assessmentSubmissionRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;