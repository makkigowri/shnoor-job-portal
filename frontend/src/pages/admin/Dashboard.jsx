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
  <AdminLayout
    title="Admin Dashboard"
    subtitle="Recent activity across the Shnoor Job Portal application."
  >
    {loading && (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-[#7393D3]">
          <div className="h-5 w-5 rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3] animate-spin"></div>
          <span className="font-medium">Loading dashboard...</span>
        </div>
      </div>
    )}

    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    )}

    {!loading && !error && (
      <div className="rounded-3xl border border-gray-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden min-h-[70vh] flex flex-col">

        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-6 py-5">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#3E3A74] tracking-tight">
                Recent Activities
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Latest actions across the platform
              </p>
            </div>

            <div className="rounded-full bg-[#7393D3]/10 px-4 py-2">
              <span className="text-sm font-semibold text-[#7393D3]">
                {activities.length}{" "}
                {activities.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 flex-1">

          {activities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF1FB] text-2xl">
                📋
              </div>

              <h4 className="text-lg font-semibold text-[#3E3A74]">
                No Recent Activity
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Platform activities will appear here once users start interacting.
              </p>
            </div>
          )}

          {activities.map((activity, index) => (
            <div
              key={index}
              className="group px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#EEF1FB]/40 transition-all duration-300 hover:translate-x-1"
            >
              <div className="flex items-start sm:items-center gap-4">

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1FB] text-[#7393D3] font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  {(activity.activity_type || "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-[#3E3A74] transition-colors duration-300">
                    {activity.activity_type}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {activity.actor}
                    {activity.detail ? ` • ${activity.detail}` : ""}
                  </p>
                </div>
              </div>

              <span className="text-sm text-gray-400 font-medium shrink-0 pl-16 sm:pl-0">
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
