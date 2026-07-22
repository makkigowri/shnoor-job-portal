import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import { fetchAdminAssessments, fetchAdminAssessmentById } from "../../services/adminAssessmentService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const completionRateOf = (a) => (a.assigned_count > 0 ? Math.round((a.submitted_count / a.assigned_count) * 100) : 0);
const AdminAssessmentReports = () => {
  const [data, setData] = useState({ assessments: [], page: 1, totalPages: 1 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminAssessments({ status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(1);
  }, [status]);
  const handleViewReport = async (id) => {
    setReportLoading(true);
    try {
      const result = await fetchAdminAssessmentById(id);
      setReport(result.assessment);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load this report.");
    } finally {
      setReportLoading(false);
    }
  };
  return (
    <AdminLayout title="Assessment Reports" subtitle="Completion and question breakdown for every assessment.">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Closed">Closed</option>
        </select>
        <div className="flex gap-3">
          <Link
            to="/admin/assessments"
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium transition"
          >
            Management
          </Link>
          <Link
            to="/admin/assessments/analytics"
            className="px-5 py-2.5 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white font-medium transition"
          >
            Analytics
          </Link>
        </div>
      </div>
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Recruiter</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Assigned</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
              <th className="px-6 py-3 font-medium">Completion Rate</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Report</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Loading report data...</td></tr>
            )}
            {!loading && data.assessments.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No assessments found</td></tr>
            )}
            {!loading && data.assessments.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{a.title}</td>
                <td className="px-6 py-3 text-gray-600">{a.recruiter_name}</td>
                <td className="px-6 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-6 py-3 text-gray-600">{a.assigned_count}</td>
                <td className="px-6 py-3 text-gray-600">{a.submitted_count}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7393D3] rounded-full"
                        style={{ width: `${completionRateOf(a)}%` }}
                      />
                    </div>
                    <span className="text-gray-600 text-xs font-medium">{completionRateOf(a)}%</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-gray-600">{formatDate(a.created_at)}</td>
                <td className="px-6 py-3">
                  <button onClick={() => handleViewReport(a.id)} className="text-[#7393D3] font-medium hover:underline">
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={data.page} totalPages={data.totalPages} onChange={load} />
      </div>
      {reportLoading && <p className="mt-4 text-gray-500">Loading report...</p>}
      {report && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#3E3A74]">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Recruiter: {report.recruiter_name} · {report.job_title || "No linked job"}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs">Assigned</p>
                <p className="text-2xl font-bold text-[#3E3A74] mt-1">{report.assigned_count}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs">Submitted</p>
                <p className="text-2xl font-bold text-[#3E3A74] mt-1">{report.submitted_count}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs">Completion Rate</p>
                <p className="text-2xl font-bold text-[#3E3A74] mt-1">{completionRateOf(report)}%</p>
              </div>
            </div>
            <div className="mt-6 text-sm space-y-1">
              <p><span className="text-gray-500">Duration:</span> {report.duration_minutes} minutes</p>
              <p><span className="text-gray-500">Total / Passing Marks:</span> {report.total_marks} / {report.passing_marks}</p>
            </div>
            <h4 className="mt-6 font-semibold text-[#3E3A74]">Question Breakdown ({report.questions?.length || 0})</h4>
            <div className="mt-3 space-y-2">
              {(report.questions || []).map((q, i) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-3 text-sm flex items-center justify-between">
                  <span className="text-gray-800">{i + 1}. {q.question_text}</span>
                  <span className="text-gray-500 shrink-0 ml-3">{q.question_type} · {q.marks}m</span>
                </div>
              ))}
              {(!report.questions || report.questions.length === 0) && (
                <p className="text-gray-500 text-sm">No questions added yet.</p>
              )}
            </div>
            <p className="mt-6 text-xs text-gray-400">
              Note: individual candidate results are managed by the recruiter who owns this assessment.
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setReport(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminAssessmentReports;
