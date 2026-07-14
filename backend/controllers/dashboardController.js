const pool = require("../config/db");
const { getProfileByUserId } = require("../models/profileModel");
const { getApplicationsByUser, countApplicationsForRecruiter, getRecentApplicationsForRecruiter } = require("../models/applicationModel");
const { getSavedJobsByUser } = require("../models/savedJobModel");
const { getUnreadCount } = require("../models/notificationModel");
const { findJobsByRecruiter } = require("../models/jobModel");
const { countUpcomingInterviewsForRecruiter } = require("../models/interviewModel");
const PROFILE_FIELDS = ["location","qualification","specialization","skills","about","photo_path"];
const calculateProfileCompletion = (profile, hasResume) => {
  const totalChecks = PROFILE_FIELDS.length + 1; // +1 for resume
  let filled = 0;
  if (profile) {
    PROFILE_FIELDS.forEach((field) => {
      if (profile[field] && String(profile[field]).trim().length > 0) {
        filled += 1;
      }
    });
  }
  if (hasResume) {
    filled += 1;
  }
  const percentage = Math.round((filled / totalChecks) * 100);
  return Math.min(percentage, 100);
};
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [profile, applications, savedJobs, unreadCount] = await Promise.all([
      getProfileByUserId(userId),
      getApplicationsByUser(userId),
      getSavedJobsByUser(userId),
      getUnreadCount(userId)
    ]);
    const hasResume = Boolean(profile && profile.resume_path);
    const profileCompletion = calculateProfileCompletion(profile, hasResume);
    const activeApplications = applications.filter((a) => a.status !== "Withdrawn");
    const shortlistedCount = applications.filter(
      (a) => a.status === "Shortlisted" || a.status === "Interview Scheduled"
    ).length;
    const recommendedQuery = `
      SELECT
        j.id, j.title, j.location, j.salary, j.employment_type, j.experience, j.created_at,
        c.company_name,
        c.logo_path AS company_logo,
        (sj.id IS NOT NULL) AS is_saved,
        ap.status AS application_status
      FROM jobs j LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id LEFT JOIN saved_jobs sj ON sj.job_id = j.id AND sj.user_id = $1 LEFT JOIN applications ap ON ap.job_id = j.id AND ap.user_id = $1
      WHERE j.status = 'Active' AND ap.id IS NULL ORDER BY j.created_at DESC LIMIT 3 `;
    const recommendedResult = await pool.query(recommendedQuery, [userId]);
    const recentApplications = applications.slice(0, 5);
    res.status(200).json({
      success: true,
      stats: {
        profileCompletion,
        jobsApplied: activeApplications.length,
        savedJobs: savedJobs.length,
        shortlisted: shortlistedCount,
        unreadNotifications: unreadCount
      },
      hasResume,
      recommendedJobs: recommendedResult.rows,
      recentApplications
    });
  } catch (error) {
    next(error);
  }
};
const getRecruiterDashboardSummary = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const [jobs, applicationStats, upcomingInterviews, unreadCount, recentApplications] = await Promise.all([
      findJobsByRecruiter(recruiterId),
      countApplicationsForRecruiter(recruiterId),
      countUpcomingInterviewsForRecruiter(recruiterId),
      getUnreadCount(recruiterId),
      getRecentApplicationsForRecruiter(recruiterId, 5)
    ]);
    const activeJobs = jobs.filter((job) => job.status === "Active");
    const jobPerformance = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      location: job.location,
      status: job.status,
      applicationsCount: job.applications_count || 0
    }));
    res.status(200).json({
      success: true,
      stats: {
        activeJobs: activeJobs.length,
        totalJobs: jobs.length,
        applications: applicationStats.total,
        shortlisted: applicationStats.shortlisted,
        pending: applicationStats.pending,
        interviews: upcomingInterviews,
        unreadNotifications: unreadCount
      },
      recentApplications,
      jobPerformance
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getDashboardSummary, getRecruiterDashboardSummary };
