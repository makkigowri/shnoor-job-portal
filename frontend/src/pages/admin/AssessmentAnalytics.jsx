import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import { fetchAdminAssessmentStatistics } from "../../services/adminAssessmentService";
const AdminAssessmentAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchAdminAssessmentStatistics();
        setStats(result.statistics);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  if (loading) {
    return (
      <AdminLayout title="Assessment Analytics" subtitle="Platform-wide assessment performance at a glance.">
        <p className="text-gray-500">Loading analytics...</p>
      </AdminLayout>
    );
  }
  if (error || !stats) {
    return (
      <AdminLayout title="Assessment Analytics" subtitle="Platform-wide assessment performance at a glance.">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "No analytics available."}
        </div>
      </AdminLayout>
    );
  }
  const passRate = stats.total_submissions > 0
    ? Math.round((stats.total_passed / stats.total_submissions) * 100)
    : 0;
  const failRate = 100 - passRate;
  const completionRate = stats.total_assignments > 0
    ? Math.round((stats.completed_assignments / stats.total_assignments) * 100)
    : 0;
  const statusBars = [
    { label: "Draft", value: stats.draft_assessments, color: "bg-gray-400" },
    { label: "Published", value: stats.published_assessments, color: "bg-green-500" },
    { label: "Closed", value: stats.closed_assessments, color: "bg-red-400" }
  ];
  const maxStatus = Math.max(1, ...statusBars.map((s) => s.value));
  return (
    <AdminLayout title="Assessment Analytics" subtitle="Platform-wide assessment performance at a glance.">
      <div className="flex items-center justify-end gap-3 mb-6">
        <Link
          to="/admin/assessments"
          className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium transition"
        >
          Management
        </Link>
        <Link
          to="/admin/assessments/reports"
          className="px-5 py-2.5 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white font-medium transition"
        >
          Reports
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Assessments" value={stats.total_assessments} />
        <StatCard label="Total Questions" value={stats.total_questions} />
        <StatCard label="Total Assignments" value={stats.total_assignments} />
        <StatCard label="Total Submissions" value={stats.total_submissions} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        <StatCard label="Completed Assignments" value={stats.completed_assignments} />
        <StatCard label="Expired Assignments" value={stats.expired_assignments} />
        <StatCard label="Total Passed" value={stats.total_passed} />
        <StatCard label="Total Failed" value={stats.total_failed} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#3E3A74]">Assessments by Status</h2>
          <div className="mt-8 h-56 flex items-end justify-around">
            {statusBars.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-600 mb-1">{s.value}</span>
                <div
                  className={`${s.color} rounded-t-lg w-14 transition-all`}
                  style={{ height: `${Math.max(6, (s.value / maxStatus) * 180)}px` }}
                />
                <span className="mt-3 text-sm text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#3E3A74]">Pass vs Fail</h2>
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-500">Pass Rate</span>
              <span className="font-semibold text-green-600">{passRate}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${passRate}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm mb-1.5 mt-6">
              <span className="text-gray-500">Fail Rate</span>
              <span className="font-semibold text-red-500">{failRate}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full" style={{ width: `${failRate}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm mb-1.5 mt-6">
              <span className="text-gray-500">Average Score</span>
              <span className="font-semibold text-[#3E3A74]">{Number(stats.avg_percentage).toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#7393D3] rounded-full" style={{ width: `${stats.avg_percentage}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm mb-1.5 mt-6">
              <span className="text-gray-500">Assignment Completion Rate</span>
              <span className="font-semibold text-[#3E3A74]">{completionRate}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#3E3A74] rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default AdminAssessmentAnalytics;
