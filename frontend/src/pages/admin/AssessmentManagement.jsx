import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  fetchAdminAssessments,
  fetchAdminAssessmentById,
  deleteAdminAssessment
} from "../../services/adminAssessmentService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const AdminAssessmentManagement = () => {
  const [data, setData] = useState({ assessments: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewAssessment, setViewAssessment] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminAssessments({ search, status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessments.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleView = async (id) => {
    setViewLoading(true);
    try {
      const result = await fetchAdminAssessmentById(id);
      setViewAssessment(result.assessment);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessment details.");
    } finally {
      setViewLoading(false);
    }
  };
  const runConfirmed = async () => {
    if (!confirmAction) return;
    try {
      await deleteAdminAssessment(confirmAction.id);
      await load(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setConfirmAction(null);
    }
  };
  return (
    <AdminLayout title="Assessment Management" subtitle="Oversee every assessment created across the platform.">
      <div className="flex items-center justify-end gap-3 mb-6">
        <Link
          to="/admin/assessments/analytics"
          className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium transition"
        >
          Analytics
        </Link>
        <Link
          to="/admin/assessments/reports"
          className="px-5 py-2.5 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white font-medium transition"
        >
          Reports
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by assessment title or recruiter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-sm rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#7393D3] text-white font-medium hover:bg-[#5E84D6]">
              Search
            </button>
          </form>
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
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Recruiter</th>
              <th className="px-6 py-3 font-medium">Questions</th>
              <th className="px-6 py-3 font-medium">Assigned</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Loading assessments...</td></tr>
            )}
            {!loading && data.assessments.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No assessments found</td></tr>
            )}
            {!loading && data.assessments.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{a.title}</td>
                <td className="px-6 py-3 text-gray-600">{a.recruiter_name}</td>
                <td className="px-6 py-3 text-gray-600">{a.question_count}</td>
                <td className="px-6 py-3 text-gray-600">{a.assigned_count}</td>
                <td className="px-6 py-3 text-gray-600">{a.submitted_count}</td>
                <td className="px-6 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-6 py-3 text-gray-600">{formatDate(a.created_at)}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleView(a.id)} className="text-[#7393D3] font-medium hover:underline">
                      View
                    </button>
                    <button
                      onClick={() => setConfirmAction({ id: a.id, name: a.title })}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={data.page} totalPages={data.totalPages} onChange={load} />
      </div>
      {viewLoading && <p className="mt-4 text-gray-500">Loading assessment...</p>}
      {viewAssessment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-[#3E3A74]">{viewAssessment.title}</h3>
              <StatusBadge status={viewAssessment.status} />
            </div>
            <div className="space-y-2 text-sm mt-4">
              <p><span className="text-gray-500">Recruiter:</span> {viewAssessment.recruiter_name} ({viewAssessment.recruiter_email})</p>
              <p><span className="text-gray-500">Linked Job:</span> {viewAssessment.job_title || "—"}</p>
              <p><span className="text-gray-500">Duration:</span> {viewAssessment.duration_minutes} minutes</p>
              <p><span className="text-gray-500">Total / Passing Marks:</span> {viewAssessment.total_marks} / {viewAssessment.passing_marks}</p>
              <p><span className="text-gray-500">Assigned:</span> {viewAssessment.assigned_count} · <span className="text-gray-500">Submitted:</span> {viewAssessment.submitted_count}</p>
              <p><span className="text-gray-500">Created:</span> {formatDate(viewAssessment.created_at)}</p>
              {viewAssessment.description && (
                <div>
                  <p className="text-gray-500">Description:</p>
                  <p className="text-gray-700 whitespace-pre-line">{viewAssessment.description}</p>
                </div>
              )}
            </div>

            <h4 className="mt-6 font-semibold text-[#3E3A74]">Questions ({viewAssessment.questions?.length || 0})</h4>
            <div className="mt-3 space-y-2">
              {(viewAssessment.questions || []).map((q, i) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-3 text-sm">
                  <p className="font-medium text-gray-900">{i + 1}. {q.question_text}</p>
                  <p className="text-gray-500 mt-1">{q.question_type} · {q.marks} marks</p>
                </div>
              ))}
              {(!viewAssessment.questions || viewAssessment.questions.length === 0) && (
                <p className="text-gray-500 text-sm">No questions added yet.</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewAssessment(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title="Delete Assessment"
        message={`This will permanently delete "${confirmAction?.name}" along with its questions, assignments and submissions. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={runConfirmed}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminLayout>
  );
};
export default AdminAssessmentManagement;
