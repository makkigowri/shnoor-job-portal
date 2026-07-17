import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchAdminAnalytics } from "../../services/adminDashboardService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const analyticsData = await fetchAdminAnalytics();
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activities = analytics?.recentActivities || [];

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Recent activity across the Shnoor Job Portal application.">
      {loading && <p className="text-gray-500">Loading dashboard...</p>}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[70vh] flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#3E3A74]">Recent Activities</h3>
              <p className="text-sm text-gray-500 mt-0.5">Latest actions across the platform</p>
            </div>
            <span className="text-xs font-medium text-gray-400">
              {activities.length} {activities.length === 1 ? "activity" : "activities"}
            </span>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {activities.length === 0 && (
              <div className="px-6 py-24 text-center text-gray-400">No activity yet</div>
            )}
            {activities.map((activity, index) => (
              <div
                key={index}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:justify-between hover:bg-gray-50/70 transition"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF1FB] text-[#7393D3] font-semibold">
                    {(activity.activity_type || "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{activity.activity_type}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {activity.actor}
                      {activity.detail ? ` · ${activity.detail}` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400 sm:text-right shrink-0 pl-14 sm:pl-0">
                  {formatDate(activity.occurred_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminDashboard;
