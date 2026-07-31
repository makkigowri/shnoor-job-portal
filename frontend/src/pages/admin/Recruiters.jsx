import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import ActionMenu from "../../components/admin/ActionMenu";
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
  <AdminLayout
    title="Recruiters"
    subtitle="Manage all recruiter accounts and their companies."
  >
    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    )}

    <div className="rounded-3xl border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-visible">

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Search by recruiter, email or company..."
        filters={[
          {
            name: "status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "blocked", label: "Blocked" },
            ],
          },
        ]}
      />

      <table className="min-w-full table-fixed text-sm">

        <thead>
          <tr className="bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] text-left">

            <th className="w-[24%] px-6 py-4 font-semibold text-[#3E3A74]">
              Company
            </th>

            <th className="w-[20%] px-6 py-4 font-semibold text-[#3E3A74]">
              Recruiter
            </th>

            <th className="w-[22%] px-6 py-4 font-semibold text-[#3E3A74]">
              Email
            </th>

            <th className="w-[10%] px-6 py-4 font-semibold text-[#3E3A74]">
              Jobs
            </th>

            <th className="w-[10%] px-6 py-4 font-semibold text-[#3E3A74]">
              Applications
            </th>

            <th className="w-[8%] px-6 py-4 font-semibold text-[#3E3A74]">
              Status
            </th>

            <th className="w-[6%] px-6 py-4 text-center font-semibold text-[#3E3A74]">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          {loading && (
            <tr>
              <td colSpan={7} className="py-16">

                <div className="flex justify-center items-center gap-3">

                  <div className="h-5 w-5 rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3] animate-spin"></div>

                  <span className="font-medium text-[#7393D3]">
                    Loading recruiters...
                  </span>

                </div>

              </td>
            </tr>
          )}

          {!loading && data.recruiters.length === 0 && (
            <tr>
              <td colSpan={7} className="py-20">

                <div className="flex flex-col items-center">

                  <div className="h-16 w-16 rounded-2xl bg-[#EEF1FB] flex items-center justify-center">
                    <div className="h-8 w-8 rounded-lg bg-[#7393D3]/15"></div>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#3E3A74]">
                    No Recruiters Found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter.
                  </p>

                </div>

              </td>
            </tr>
          )}

          {!loading &&
            data.recruiters.map((recruiter) => (
              <tr
                key={recruiter.id}
                className="border-t border-gray-100 transition-all duration-300 hover:bg-[#EEF1FB]/40"
              >
                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    

                    <div>

                      <p className="font-semibold text-[#3E3A74]">
                        {recruiter.company_name || "Not Provided"}
                      </p>

                      <p className="text-xs text-gray-500">
                        Company Profile
                      </p>

                    </div>

                  </div>

                </td>

                <td className="px-6 py-4">

                  <div>

                    <p className="font-medium text-gray-800">
                      {recruiter.fullname}
                    </p>

                    <p className="text-xs text-gray-500">
                      Recruiter
                    </p>

                  </div>

                </td>

                <td className="px-6 py-4 text-gray-600 break-all">
                  {recruiter.email}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-xl bg-[#EEF1FB] px-3 py-1 text-[#3E3A74] font-semibold">
                    {recruiter.jobs_posted}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-xl bg-[#EEF1FB] px-3 py-1 text-[#3E3A74] font-semibold">
                    {recruiter.applications_count}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge
                    status={
                      recruiter.is_blocked
                        ? "Blocked"
                        : "Active"
                    }
                  />
                </td>

                <td className="px-6 py-4 flex justify-center">

                  <ActionMenu
                    items={[
                      {
                        key: "view",
                        label: "View",
                        onClick: () =>
                          handleView(recruiter.id),
                      },
                      {
                        key: "block",
                        label: recruiter.is_blocked
                          ? "Unblock"
                          : "Block",
                        onClick: () =>
                          setConfirmAction({
                            type: recruiter.is_blocked
                              ? "unblock"
                              : "block",
                            id: recruiter.id,
                            name: recruiter.fullname,
                          }),
                      },
                      {
                        key: "delete",
                        label: "Delete",
                        danger: true,
                        onClick: () =>
                          setConfirmAction({
                            type: "delete",
                            id: recruiter.id,
                            name: recruiter.fullname,
                          }),
                      },
                    ]}
                  />

                </td>

              </tr>
            ))}

        </tbody>
      </table>

      <div className="border-t border-gray-100 bg-white px-2 py-4">

        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={load}
        />

      </div>

    </div>
        {viewRecruiter && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-xl overflow-visible rounded-3xl border border-gray-200 bg-white shadow-2xl">

          <div className="border-b border-gray-100 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-6 py-5">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7393D3]/10 text-xl font-bold text-[#7393D3] shadow-sm">
                {(viewRecruiter.company_name || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#3E3A74]">
                  Recruiter Details
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Company & recruiter information
                </p>
              </div>

            </div>
          </div>

          <div className="p-6">

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Recruiter
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewRecruiter.fullname}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Company
                </p>

                <p className="mt-2 font-semibold text-[#3E3A74]">
                  {viewRecruiter.company_name || "—"}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email Address
                </p>

                <p className="mt-2 break-all text-gray-700">
                  {viewRecruiter.email}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Phone Number
                </p>

                <p className="mt-2 text-gray-700">
                  {viewRecruiter.phone || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Industry
                </p>

                <p className="mt-2 text-gray-700">
                  {viewRecruiter.industry || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Headquarters
                </p>

                <p className="mt-2 text-gray-700">
                  {viewRecruiter.headquarters || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Joined On
                </p>

                <p className="mt-2 text-gray-700">
                  {formatDate(viewRecruiter.created_at)}
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-[#7393D3]/15 bg-[#EEF1FB]/60 p-5 text-center">

                <p className="text-3xl font-bold text-[#3E3A74]">
                  {viewRecruiter.jobs_posted}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Jobs Posted
                </p>

              </div>

              <div className="rounded-2xl border border-[#7393D3]/15 bg-[#EEF1FB]/60 p-5 text-center">

                <p className="text-3xl font-bold text-[#3E3A74]">
                  {viewRecruiter.applications_count}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Applications
                </p>

              </div>

            </div>

            <div className="mt-8 flex justify-end">

              <button
                onClick={() => setViewRecruiter(null)}
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
      confirmLabel={
        confirmAction?.type === "delete"
          ? "Delete"
          : confirmAction?.type === "block"
          ? "Block"
          : "Unblock"
      }
      danger={
        confirmAction?.type === "delete" ||
        confirmAction?.type === "block"
      }
      onConfirm={runConfirmed}
      onCancel={() => setConfirmAction(null)}
    />
  </AdminLayout>
);
};
export default AdminRecruiters;
