import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import ActionMenu from "../../components/admin/ActionMenu";
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
  <AdminLayout
    title="Applications"
    subtitle="View and manage all job applications submitted on the platform."
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
        searchPlaceholder="Search by candidate, job or recruiter..."
        filters={[
          {
            name: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All Status" },
              { value: "Applied", label: "Applied" },
              { value: "Under Review", label: "Under Review" },
              { value: "Shortlisted", label: "Shortlisted" },
              { value: "Interview Scheduled", label: "Interview Scheduled" },
              { value: "Rejected", label: "Rejected" },
              { value: "Selected", label: "Selected" },
            ],
          },
        ]}
      />

    </div>

    <div className="overflow-visible">

      <table className="min-w-full table-fixed text-sm">

        <thead>

          <tr className="border-b border-gray-200 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB]">

            <th className="w-[20%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Candidate
            </th>

            <th className="w-[20%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Applied Job
            </th>

            <th className="w-[15%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Recruiter
            </th>

            <th className="w-[10%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Resume
            </th>

            <th className="w-[10%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              ATS Score
            </th>

            <th className="w-[12%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Status
            </th>

            <th className="w-[10%] px-6 py-4 text-left font-semibold text-[#3E3A74]">
              Applied
            </th>

            <th className="w-[3%] px-6 py-4 text-center font-semibold text-[#3E3A74]">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {loading && (
            <tr>
              <td colSpan={8} className="py-20">

                <div className="flex items-center justify-center gap-3">

                  <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3]"></div>

                  <span className="font-medium text-[#7393D3]">
                    Loading applications...
                  </span>

                </div>

              </td>
            </tr>
          )}

          {!loading && data.applications.length === 0 && (
            <tr>

              <td colSpan={8} className="py-20">

                <div className="flex flex-col items-center">

                  <div className="h-16 w-16 rounded-2xl bg-[#EEF1FB]"></div>

                  <h3 className="mt-5 text-lg font-semibold text-[#3E3A74]">
                    No Applications Found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    No applications match your current filters.
                  </p>

                </div>

              </td>

            </tr>
          )}

          {!loading &&
  data.applications.map((application) => (
    <tr
      key={application.id}
      className="border-b border-gray-100 transition-all duration-300 hover:bg-[#EEF1FB]/40"
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF1FB] font-semibold text-[#3E3A74]">
            {application.candidate_name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>

          <div>

            <p className="font-semibold text-[#3E3A74]">
              {application.candidate_name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Candidate
            </p>

          </div>

        </div>
      </td>

      <td className="px-6 py-5">

        <div>

          <p className="font-medium text-gray-800">
            {application.job_title}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Applied Position
          </p>

        </div>

      </td>

      <td className="px-6 py-5 text-gray-600">
        {application.recruiter_name}
      </td>

      <td className="px-6 py-5">

        {application.resume_path ? (

          <a
            href={`${API_ORIGIN}${application.resume_path}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-xl bg-[#EEF1FB] px-4 py-2 text-sm font-semibold text-[#3E3A74] transition-all duration-300 hover:bg-[#7393D3] hover:text-white"
          >
            View Resume
          </a>

        ) : (

          <span className="text-gray-400">
            —
          </span>

        )}

      </td>

      <td className="px-6 py-5">

        {application.ats_score != null ? (

          <div className="flex items-center gap-3">

            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-[#7393D3]"
                style={{
                  width: `${Math.min(application.ats_score, 100)}%`,
                }}
              />

            </div>

            <span className="font-semibold text-[#3E3A74]">
              {application.ats_score}
            </span>

          </div>

        ) : (

          <span className="text-gray-400">
            —
          </span>

        )}

      </td>

      <td className="px-6 py-5">
        <StatusBadge status={application.status} />
      </td>

      <td className="px-6 py-5 text-gray-600">
        {formatDate(application.applied_at)}
      </td>

      <td className="px-6 py-5 text-center">

        <ActionMenu
          items={[
            {
              key: "view",
              label: "View",
              onClick: () => handleView(application.id),
            },
            {
              key: "delete",
              label: "Delete",
              danger: true,
              onClick: () =>
                setConfirmAction({
                  id: application.id,
                  name: application.candidate_name,
                }),
            },
          ]}
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
        {viewApplication && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

        <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

          <div className="border-b border-gray-100 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-7 py-6">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-2xl font-bold text-[#3E3A74]">
                  {viewApplication.candidate_name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Application Details
                </p>

              </div>

              <StatusBadge status={viewApplication.status} />

            </div>

          </div>

          <div className="max-h-[70vh] overflow-y-auto p-7">

            <div className="grid grid-cols-2 gap-5">

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Candidate
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewApplication.candidate_name}
                </p>

                <p className="text-sm text-gray-500">
                  {viewApplication.candidate_email}
                </p>

              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Recruiter
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewApplication.recruiter_name}
                </p>

                <p className="text-sm text-gray-500">
                  {viewApplication.recruiter_email}
                </p>

              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Applied Job
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewApplication.job_title}
                </p>

              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Job Location
                </p>

                <p className="mt-2 text-gray-700">
                  {viewApplication.job_location}
                </p>

              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ATS Score
                </p>

                {viewApplication.ats_score != null ? (

                  <div className="mt-3">

                    <div className="mb-2 flex justify-between">

                      <span className="text-sm text-gray-500">
                        Resume Match
                      </span>

                      <span className="font-semibold text-[#3E3A74]">
                        {viewApplication.ats_score}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-[#7393D3]"
                        style={{
                          width: `${Math.min(
                            viewApplication.ats_score,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ) : (

                  <p className="mt-2 text-gray-400">
                    —
                  </p>

                )}

              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/60 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Applied Date
                </p>

                <p className="mt-2 text-gray-700">
                  {formatDate(viewApplication.applied_at)}
                </p>

              </div>

            </div>

            {viewApplication.recruiter_note && (

              <div className="mt-6 rounded-2xl bg-[#EEF1FB]/50 p-6">

                <h4 className="mb-3 font-semibold text-[#3E3A74]">
                  Recruiter Note
                </h4>

                <p className="leading-7 whitespace-pre-line text-gray-700">
                  {viewApplication.recruiter_note}
                </p>

              </div>

            )}

            <div className="mt-8 flex justify-end">

              <button
                onClick={() => setViewApplication(null)}
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