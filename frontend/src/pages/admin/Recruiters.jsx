import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  fetchRecruiters,
  blockRecruiter,
  unblockRecruiter,
  deleteRecruiter,
  fetchRecruiterById
} from "../../services/adminRecruiterService";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");

const AdminRecruiters = () => {
  const [data, setData] = useState({ recruiters: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewRecruiter, setViewRecruiter] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchRecruiters({ search, status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recruiters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleView = async (id) => {
    try {
      const result = await fetchRecruiterById(id);
      setViewRecruiter(result.recruiter);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recruiter details.");
    }
  };

  const runConfirmed = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "block") await blockRecruiter(confirmAction.id);
      if (confirmAction.type === "unblock") await unblockRecruiter(confirmAction.id);
      if (confirmAction.type === "delete") await deleteRecruiter(confirmAction.id);
      await load(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <AdminLayout title="Recruiters" subtitle="Manage all recruiter accounts and their companies.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by recruiter, email or company..."
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
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Recruiter</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Jobs Posted</th>
              <th className="px-6 py-3 font-medium">Applications</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading recruiters...</td></tr>
            )}
            {!loading && data.recruiters.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No recruiters found</td></tr>
            )}
            {!loading && data.recruiters.map((recruiter) => (
              <tr key={recruiter.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{recruiter.company_name || "—"}</td>
                <td className="px-6 py-3 text-gray-600">{recruiter.fullname}</td>
                <td className="px-6 py-3 text-gray-600">{recruiter.email}</td>
                <td className="px-6 py-3 text-gray-600">{recruiter.jobs_posted}</td>
                <td className="px-6 py-3 text-gray-600">{recruiter.applications_count}</td>
                <td className="px-6 py-3"><StatusBadge status={recruiter.is_blocked ? "Blocked" : "Active"} /></td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleView(recruiter.id)} className="text-[#7393D3] font-medium hover:underline">
                      View
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: recruiter.is_blocked ? "unblock" : "block",
                          id: recruiter.id,
                          name: recruiter.fullname
                        })
                      }
                      className="text-amber-600 font-medium hover:underline"
                    >
                      {recruiter.is_blocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: "delete", id: recruiter.id, name: recruiter.fullname })}
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

      {viewRecruiter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#3E3A74] mb-4">Recruiter Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Recruiter:</span> {viewRecruiter.fullname}</p>
              <p><span className="text-gray-500">Email:</span> {viewRecruiter.email}</p>
              <p><span className="text-gray-500">Phone:</span> {viewRecruiter.phone}</p>
              <p><span className="text-gray-500">Company:</span> {viewRecruiter.company_name || "—"}</p>
              <p><span className="text-gray-500">Industry:</span> {viewRecruiter.industry || "—"}</p>
              <p><span className="text-gray-500">Headquarters:</span> {viewRecruiter.headquarters || "—"}</p>
              <p><span className="text-gray-500">Jobs Posted:</span> {viewRecruiter.jobs_posted}</p>
              <p><span className="text-gray-500">Applications:</span> {viewRecruiter.applications_count}</p>
              <p><span className="text-gray-500">Joined:</span> {formatDate(viewRecruiter.created_at)}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewRecruiter(null)}
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
            ? "Delete Recruiter"
            : confirmAction?.type === "block"
            ? "Block Recruiter"
            : "Unblock Recruiter"
        }
        message={
          confirmAction?.type === "delete"
            ? `This will permanently delete "${confirmAction?.name}", their company profile and job postings. This cannot be undone.`
            : confirmAction?.type === "block"
            ? `"${confirmAction?.name}" will no longer be able to log in.`
            : `"${confirmAction?.name}" will be able to log in again.`
        }
        confirmLabel={confirmAction?.type === "delete" ? "Delete" : confirmAction?.type === "block" ? "Block" : "Unblock"}
        danger={confirmAction?.type === "delete" || confirmAction?.type === "block"}
        onConfirm={runConfirmed}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminLayout>
  );
};

export default AdminRecruiters;
