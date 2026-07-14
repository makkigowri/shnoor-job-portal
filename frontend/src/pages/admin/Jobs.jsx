import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  fetchAdminJobs,
  fetchAdminJobById,
  updateAdminJobStatus,
  deleteAdminJob
} from "../../services/adminJobService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const AdminJobs = () => {
  const [data, setData] = useState({ jobs: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewJob, setViewJob] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminJobs({ search, status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load jobs.");
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
      const result = await fetchAdminJobById(id);
      setViewJob(result.job);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load job details.");
    }
  };
  const runConfirmed = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "activate") await updateAdminJobStatus(confirmAction.id, "Active");
      if (confirmAction.type === "close") await updateAdminJobStatus(confirmAction.id, "Closed");
      if (confirmAction.type === "delete") await deleteAdminJob(confirmAction.id);
      await load(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setConfirmAction(null);
    }
  };
  return (
    <AdminLayout title="Jobs" subtitle="Manage every job posting across the platform.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by job title, location or recruiter..."
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
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Job Title</th>
              <th className="px-6 py-3 font-medium">Recruiter</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Applications</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created Date</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading jobs...</td></tr>
            )}
            {!loading && data.jobs.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No jobs found</td></tr>
            )}
            {!loading && data.jobs.map((job) => (
              <tr key={job.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{job.title}</td>
                <td className="px-6 py-3 text-gray-600">{job.recruiter_name}</td>
                <td className="px-6 py-3 text-gray-600">{job.location}</td>
                <td className="px-6 py-3 text-gray-600">{job.applications_count}</td>
                <td className="px-6 py-3"><StatusBadge status={job.status} /></td>
                <td className="px-6 py-3 text-gray-600">{formatDate(job.created_at)}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleView(job.id)} className="text-[#7393D3] font-medium hover:underline">
                      View
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: job.status === "Active" ? "close" : "activate",
                          id: job.id,
                          name: job.title
                        })
                      }
                      className="text-amber-600 font-medium hover:underline"
                    >
                      {job.status === "Active" ? "Close" : "Activate"}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: "delete", id: job.id, name: job.title })}
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

      {viewJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#3E3A74] mb-4">Job Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Title:</span> {viewJob.title}</p>
              <p><span className="text-gray-500">Recruiter:</span> {viewJob.recruiter_name} ({viewJob.recruiter_email})</p>
              <p><span className="text-gray-500">Company:</span> {viewJob.company_name || "—"}</p>
              <p><span className="text-gray-500">Location:</span> {viewJob.location}</p>
              <p><span className="text-gray-500">Employment Type:</span> {viewJob.employment_type || "—"}</p>
              <p><span className="text-gray-500">Openings:</span> {viewJob.openings || "—"}</p>
              <p><span className="text-gray-500">Applications:</span> {viewJob.applications_count}</p>
              <p><span className="text-gray-500">Status:</span> {viewJob.status}</p>
              <p><span className="text-gray-500">Posted:</span> {formatDate(viewJob.created_at)}</p>
              {viewJob.description && (
                <div>
                  <p className="text-gray-500">Description:</p>
                  <p className="text-gray-700 whitespace-pre-line">{viewJob.description}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewJob(null)}
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
        title={
          confirmAction?.type === "delete"
            ? "Delete Job"
            : confirmAction?.type === "close"
            ? "Close Job"
            : "Activate Job"
        }
        message={
          confirmAction?.type === "delete"
            ? `This will permanently delete "${confirmAction?.name}" and all its applications. This cannot be undone.`
            : confirmAction?.type === "close"
            ? `"${confirmAction?.name}" will no longer accept new applications.`
            : `"${confirmAction?.name}" will be visible and open for applications again.`
        }
        confirmLabel={confirmAction?.type === "delete" ? "Delete" : confirmAction?.type === "close" ? "Close" : "Activate"}
        danger={confirmAction?.type === "delete"}
        onConfirm={runConfirmed}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminLayout>
  );
};
export default AdminJobs;
