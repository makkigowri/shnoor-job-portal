import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  fetchAdminApplications,
  fetchAdminApplicationById,
  deleteAdminApplication
} from "../../services/adminApplicationService";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

const AdminApplications = () => {
  const [data, setData] = useState({ applications: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewApplication, setViewApplication] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminApplications({ search, status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications.");
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
    try {
      const result = await fetchAdminApplicationById(id);
      setViewApplication(result.application);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load application details.");
    }
  };

  const runConfirmed = async () => {
    if (!confirmAction) return;
    try {
      await deleteAdminApplication(confirmAction.id);
      await load(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <AdminLayout title="Applications" subtitle="View and manage all job applications submitted on the platform.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by candidate, job or recruiter..."
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
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Candidate</th>
              <th className="px-6 py-3 font-medium">Applied Job</th>
              <th className="px-6 py-3 font-medium">Recruiter</th>
              <th className="px-6 py-3 font-medium">Resume</th>
              <th className="px-6 py-3 font-medium">ATS Score</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Applied Date</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Loading applications...</td></tr>
            )}
            {!loading && data.applications.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No applications found</td></tr>
            )}
            {!loading && data.applications.map((application) => (
              <tr key={application.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{application.candidate_name}</td>
                <td className="px-6 py-3 text-gray-600">{application.job_title}</td>
                <td className="px-6 py-3 text-gray-600">{application.recruiter_name}</td>
                <td className="px-6 py-3">
                  {application.resume_path ? (
                    <a
                      href={`${API_ORIGIN}${application.resume_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#7393D3] font-medium hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-3 text-gray-600">{application.ats_score ?? "—"}</td>
                <td className="px-6 py-3"><StatusBadge status={application.status} /></td>
                <td className="px-6 py-3 text-gray-600">{formatDate(application.applied_at)}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleView(application.id)} className="text-[#7393D3] font-medium hover:underline">
                      View
                    </button>
                    <button
                      onClick={() => setConfirmAction({ id: application.id, name: application.candidate_name })}
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

      {viewApplication && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#3E3A74] mb-4">Application Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Candidate:</span> {viewApplication.candidate_name} ({viewApplication.candidate_email})</p>
              <p><span className="text-gray-500">Job:</span> {viewApplication.job_title}</p>
              <p><span className="text-gray-500">Location:</span> {viewApplication.job_location}</p>
              <p><span className="text-gray-500">Recruiter:</span> {viewApplication.recruiter_name} ({viewApplication.recruiter_email})</p>
              <p><span className="text-gray-500">ATS Score:</span> {viewApplication.ats_score ?? "—"}</p>
              <p><span className="text-gray-500">Status:</span> {viewApplication.status}</p>
              <p><span className="text-gray-500">Applied:</span> {formatDate(viewApplication.applied_at)}</p>
              {viewApplication.recruiter_note && (
                <p><span className="text-gray-500">Recruiter Note:</span> {viewApplication.recruiter_note}</p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewApplication(null)}
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
        title="Delete Application"
        message={`This will permanently delete the application from "${confirmAction?.name}". This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={runConfirmed}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminLayout>
  );
};

export default AdminApplications;
