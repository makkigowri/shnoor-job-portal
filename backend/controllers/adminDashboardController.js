const {
  getDashboardStats,
  getLatestUsers,
  getLatestRecruiters,
  getRecentJobPosts,
  getRecentApplicationsAdmin,
  getTopRecruiters,
  getTopAppliedJobs,
  getMostActiveUsers,
  getRecentRegistrations,
  getRecentActivities,
  getSystemStatistics
} = require("../models/adminStatsModel");
const getAdminDashboard = async (req, res, next) => {
  try {
    const [stats, latestUsers, latestRecruiters, recentJobPosts, recentApplications] = await Promise.all([
      getDashboardStats(),
      getLatestUsers(5),
      getLatestRecruiters(5),
      getRecentJobPosts(5),
      getRecentApplicationsAdmin(5)
    ]);
    res.status(200).json({
      success: true,
      stats: {
        totalUsers: stats.total_users,
        totalRecruiters: stats.total_recruiters,
        totalJobs: stats.total_jobs,
        activeJobs: stats.active_jobs,
        applicationsReceived: stats.applications_received,
        shortlisted: stats.shortlisted,
        rejected: stats.rejected,
        interviewsScheduled: stats.interviews_scheduled,
        pendingReviews: stats.pending_reviews
      },
      latestUsers,
      latestRecruiters,
      recentJobPosts,
      recentApplications
    });
  } catch (error) {
    next(error);
  }
};
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [topRecruiters, topAppliedJobs, recentActivities, mostActiveUsers, recentRegistrations, systemStatistics] =
      await Promise.all([
        getTopRecruiters(10),
        getTopAppliedJobs(10),
        getRecentActivities(15),
        getMostActiveUsers(10),
        getRecentRegistrations(10),
        getSystemStatistics()
      ]);
    res.status(200).json({
      success: true,
      topRecruiters,
      topAppliedJobs,
      recentActivities,
      mostActiveUsers,
      recentRegistrations,
      systemStatistics
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getAdminDashboard, getAdminAnalytics };
