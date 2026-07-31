import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import {
  fetchAdminJobs,
  fetchAdminJobById,
  updateAdminJobStatus,
  deleteAdminJob,
  exportAdminJobs
} from "../../services/adminJobService";
import { exportAdminApplicants } from "../../services/adminApplicationService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const JobActionsMenu = ({ job, exporting, onView, onExport, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSelect = (action) => {
    setOpen(false);
    action();
  };
  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#3E3A74] transition"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
          <button
            type="button"
            onClick={() => handleSelect(onView)}
            className="w-full text-left px-4 py-2 text-sm text-[#3E3A74] hover:bg-gray-50"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => handleSelect(onExport)}
            disabled={exporting}
            className="w-full text-left px-4 py-2 text-sm text-[#3E3A74] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? "Exporting..." : "Export"}
          </button>
          <button
            type="button"
            onClick={() => handleSelect(onToggleStatus)}
            className="w-full text-left px-4 py-2 text-sm text-[#3E3A74] hover:bg-gray-50"
          >
            {job.status === "Active" ? "Close Job" : "Activate Job"}
          </button>
          <button
            type="button"
            onClick={() => handleSelect(onDelete)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete Job
          </button>
        </div>
      )}
    </div>
  );
};
const AdminJobs = () => {
  const [data, setData] = useState({ jobs: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [exportingJobs, setExportingJobs] = useState(false);
  const [exportingApplicantsId, setExportingApplicantsId] = useState(null);
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
  const handleExportJobs = async () => {
    setExportingJobs(true);
    setError("");
    try {
      await exportAdminJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to export jobs right now.");
    } finally {
      setExportingJobs(false);
    }
  };
  const handleExportApplicants = async (jobId) => {
    setExportingApplicantsId(jobId);
    setError("");
    try {
      await exportAdminApplicants(jobId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to export applicants right now.");
    } finally {
      setExportingApplicantsId(null);
    }
  };
  return (
  <AdminLayout
    title="Jobs"
    subtitle="Manage every job posting across the platform."
  >
    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    )}

    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Search by job title, location or recruiter..."
        filters={[
          {
            name: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All Status" },
              { value: "Active", label: "Active" },
              { value: "Closed", label: "Closed" },
            ],
          },
        ]}
        actions={
          <button
            type="button"
            onClick={handleExportJobs}
            disabled={exportingJobs}
            className="rounded-xl bg-[#7393D3] px-5 py-2.5 font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6488cf] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportingJobs ? "Exporting..." : "Export Jobs"}
          </button>
        }
      />

    </div>

    <div className="overflow-visible">

      <table className="min-w-full table-fixed text-sm">

        <thead>

          <tr className="border-b border-gray-200 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB]">

            <th className="w-[24%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Job Title
            </th>

            <th className="w-[18%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Recruiter
            </th>

            <th className="w-[18%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Location
            </th>

            <th className="w-[10%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Applications
            </th>

            <th className="w-[10%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Status
            </th>

            <th className="w-[14%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Created
            </th>

            <th className="w-[6%] px-6 py-4 text-center font-semibold text-[#3E3A74]">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {loading && (
            <tr>
              <td colSpan={7} className="py-20">

                <div className="flex items-center justify-center gap-3">

                  <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3]"></div>

                  <span className="font-medium text-[#7393D3]">
                    Loading jobs...
                  </span>

                </div>

              </td>
            </tr>
          )}

          {!loading && data.jobs.length === 0 && (
            <tr>

              <td colSpan={7} className="py-20">

                <div className="flex flex-col items-center">

                  <div className="h-16 w-16 rounded-2xl bg-[#EEF1FB]"></div>

                  <h3 className="mt-5 text-lg font-semibold text-[#3E3A74]">
                    No Jobs Found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    No job postings match your current filters.
                  </p>

                </div>

              </td>

            </tr>
          )}

          {!loading &&
            data.jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-gray-100 transition-all duration-300 hover:bg-[#EEF1FB]/40"
              >
                <td className="px-6 py-5">

                  <div>

                    <p className="font-semibold text-[#3E3A74]">
                      {job.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Job Posting
                    </p>

                  </div>

                </td>

                <td className="px-6 py-5 text-gray-700">
                  {job.recruiter_name}
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {job.location}
                </td>

                <td className="px-6 py-5">

                  <span className="rounded-xl bg-[#EEF1FB] px-3 py-1 font-semibold text-[#3E3A74]">
                    {job.applications_count}
                  </span>

                </td>

                <td className="px-6 py-5">

                  <StatusBadge status={job.status} />

                </td>

                <td className="px-6 py-5 text-gray-600">
                  {formatDate(job.created_at)}
                </td>

                <td className="px-6 py-5 text-center">

                  <JobActionsMenu
                    job={job}
                    exporting={exportingApplicantsId === job.id}
                    onView={() => handleView(job.id)}
                    onExport={() => handleExportApplicants(job.id)}
                    onToggleStatus={() =>
                      setConfirmAction({
                        type:
                          job.status === "Active"
                            ? "close"
                            : "activate",
                        id: job.id,
                        name: job.title,
                      })
                    }
                    onDelete={() =>
                      setConfirmAction({
                        type: "delete",
                        id: job.id,
                        name: job.title,
                      })
                    }
                  />

                </td>

              </tr>
            ))}

        </tbody>

      </table>

    </div>

    <div className="mt-6 border-t border-gray-100 pt-5">

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onChange={load}
      />

    </div>
        {viewJob && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

          <div className="border-b border-gray-100 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-7 py-6">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-2xl font-bold text-[#3E3A74]">
                  {viewJob.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Job Details
                </p>

              </div>

              <StatusBadge status={viewJob.status} />

            </div>

          </div>

          <div className="max-h-[70vh] overflow-y-auto p-7">

            <div className="grid grid-cols-2 gap-5">

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Recruiter
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewJob.recruiter_name}
                </p>

                <p className="text-sm text-gray-500">
                  {viewJob.recruiter_email}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Company
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewJob.company_name || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Location
                </p>

                <p className="mt-2 text-gray-700">
                  {viewJob.location}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Employment Type
                </p>

                <p className="mt-2 text-gray-700">
                  {viewJob.employment_type || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Openings
                </p>

                <p className="mt-2 text-2xl font-bold text-[#3E3A74]">
                  {viewJob.openings || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Applications
                </p>

                <p className="mt-2 text-2xl font-bold text-[#3E3A74]">
                  {viewJob.applications_count}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl bg-[#EEF1FB]/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Posted On
                </p>

                <p className="mt-2 text-gray-700">
                  {formatDate(viewJob.created_at)}
                </p>
              </div>

            </div>

            {viewJob.description && (

              <div className="mt-6 rounded-2xl bg-[#EEF1FB]/50 p-6">

                <h4 className="mb-4 font-semibold text-[#3E3A74]">
                  Job Description
                </h4>

                <div className="leading-7 whitespace-pre-line text-gray-700">
                  {viewJob.description}
                </div>

              </div>

            )}

            <div className="mt-8 flex justify-end">

              <button
                onClick={() => setViewJob(null)}
                className="rounded-xl bg-[#7393D3] px-6 py-2.5 font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6488cf] hover:shadow-lg"
              >
                Close
              </button>

            </div>

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
      confirmLabel={
        confirmAction?.type === "delete"
          ? "Delete"
          : confirmAction?.type === "close"
          ? "Close"
          : "Activate"
      }
      danger={confirmAction?.type === "delete"}
      onConfirm={runConfirmed}
      onCancel={() => setConfirmAction(null)}
    />
  </AdminLayout>
);
};
export default AdminJobs;