import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import StatusBadge from "../../components/admin/StatusBadge";
import { fetchAdminDashboard, fetchAdminAnalytics } from "../../services/adminDashboardService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardData, analyticsData] = await Promise.all([fetchAdminDashboard(), fetchAdminAnalytics()]);
        setDashboard(dashboardData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <AdminLayout title="Admin Dashboard" subtitle="Overview of the entire Shnoor Job Portal application.">
      {loading && <p className="text-gray-500">Loading dashboard...</p>}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {dashboard && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <StatCard label="Total Users" value={dashboard.stats.totalUsers} />
            <StatCard label="Total Recruiters" value={dashboard.stats.totalRecruiters} />
            <StatCard label="Total Jobs" value={dashboard.stats.totalJobs} />
            <StatCard label="Active Jobs" value={dashboard.stats.activeJobs} />
            <StatCard label="Applications Received" value={dashboard.stats.applicationsReceived} />
            <StatCard label="Shortlisted" value={dashboard.stats.shortlisted} />
            <StatCard label="Rejected" value={dashboard.stats.rejected} />
            <StatCard label="Interviews Scheduled" value={dashboard.stats.interviewsScheduled} />
            <StatCard label="Pending Reviews" value={dashboard.stats.pendingReviews} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#3E3A74]">Latest Registered Users</h3>
                <Link to="/admin/users" className="text-sm text-[#7393D3] font-medium">View all</Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.latestUsers.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No users yet</td></tr>
                  )}
                  {dashboard.latestUsers.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{user.fullname}</td>
                      <td className="px-6 py-3 text-gray-600">{user.email}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#3E3A74]">Latest Recruiters</h3>
                <Link to="/admin/recruiters" className="text-sm text-[#7393D3] font-medium">View all</Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Recruiter</th>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.latestRecruiters.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No recruiters yet</td></tr>
                  )}
                  {dashboard.latestRecruiters.map((recruiter) => (
                    <tr key={recruiter.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{recruiter.fullname}</td>
                      <td className="px-6 py-3 text-gray-600">{recruiter.company_name || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(recruiter.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#3E3A74]">Recent Job Posts</h3>
                <Link to="/admin/jobs" className="text-sm text-[#7393D3] font-medium">View all</Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Job Title</th>
                    <th className="px-6 py-3 font-medium">Recruiter</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentJobPosts.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No jobs yet</td></tr>
                  )}
                  {dashboard.recentJobPosts.map((job) => (
                    <tr key={job.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{job.title}</td>
                      <td className="px-6 py-3 text-gray-600">{job.recruiter_name}</td>
                      <td className="px-6 py-3"><StatusBadge status={job.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#3E3A74]">Recent Applications</h3>
                <Link to="/admin/applications" className="text-sm text-[#7393D3] font-medium">View all</Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Candidate</th>
                    <th className="px-6 py-3 font-medium">Job</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentApplications.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No applications yet</td></tr>
                  )}
                  {dashboard.recentApplications.map((application) => (
                    <tr key={application.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{application.candidate_name}</td>
                      <td className="px-6 py-3 text-gray-600">{application.job_title}</td>
                      <td className="px-6 py-3"><StatusBadge status={application.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {analytics && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#3E3A74] mb-5">Analytics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard label="Total Accounts" value={analytics.systemStatistics.total_accounts} />
            <StatCard label="Total Companies" value={analytics.systemStatistics.total_companies} />
            <StatCard label="Closed Jobs" value={analytics.systemStatistics.closed_jobs} />
            <StatCard label="Blocked Accounts" value={analytics.systemStatistics.blocked_accounts} />
            <StatCard label="Total Saved Jobs" value={analytics.systemStatistics.total_saved_jobs} />
            <StatCard label="Total Interviews" value={analytics.systemStatistics.total_interviews} />
            <StatCard label="Completed Interviews" value={analytics.systemStatistics.completed_interviews} />
            <StatCard label="Average ATS Score" value={analytics.systemStatistics.avg_ats_score} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#3E3A74]">Top 10 Recruiters</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Recruiter</th>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Jobs</th>
                    <th className="px-6 py-3 font-medium">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topRecruiters.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400">No data available</td></tr>
                  )}
                  {analytics.topRecruiters.map((recruiter) => (
                    <tr key={recruiter.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{recruiter.fullname}</td>
                      <td className="px-6 py-3 text-gray-600">{recruiter.company_name || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{recruiter.jobs_posted}</td>
                      <td className="px-6 py-3 text-gray-600">{recruiter.applications_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#3E3A74]">Top Applied Jobs</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Job Title</th>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topAppliedJobs.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No data available</td></tr>
                  )}
                  {analytics.topAppliedJobs.map((job) => (
                    <tr key={job.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{job.title}</td>
                      <td className="px-6 py-3 text-gray-600">{job.company_name || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{job.applications_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#3E3A74]">Most Active Users</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.mostActiveUsers.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No data available</td></tr>
                  )}
                  {analytics.mostActiveUsers.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{user.fullname}</td>
                      <td className="px-6 py-3 text-gray-600">{user.email}</td>
                      <td className="px-6 py-3 text-gray-600">{user.applications_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#3E3A74]">Recent Registrations</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentRegistrations.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400">No data available</td></tr>
                  )}
                  {analytics.recentRegistrations.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{user.fullname}</td>
                      <td className="px-6 py-3 text-gray-600 capitalize">{user.role}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden xl:col-span-2">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#3E3A74]">Recent Activities</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Activity</th>
                    <th className="px-6 py-3 font-medium">Detail</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentActivities.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400">No activity yet</td></tr>
                  )}
                  {analytics.recentActivities.map((activity, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-800">{activity.activity_type}</td>
                      <td className="px-6 py-3 text-gray-600">{activity.actor}</td>
                      <td className="px-6 py-3 text-gray-600">{activity.detail}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(activity.occurred_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminDashboard;
