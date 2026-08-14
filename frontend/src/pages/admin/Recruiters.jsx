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
  fetchRecruiterById,
  createRecruiter
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
  const [showAddModal, setShowAddModal] = useState(false);
const [form, setForm] = useState({
  company: "SHNOOR INTERNATIONAL LLC",
  fullname: "",
  email: "",
  password: ""
});
const [creating, setCreating] = useState(false);
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
  const handleCreateRecruiter = async () => {
  try {
    setCreating(true);
    await createRecruiter({
      fullname: form.fullname,
      email: form.email,
      password: form.password
    });
    setShowAddModal(false);
    setForm({
      company: "SHNOOR INTERNATIONAL LLC",
      fullname: "",
      email: "",
      password: ""
    });
    await load(data.page);
  } catch (err) {
    setError(err.response?.data?.message || "Unable to create recruiter.");
  } finally {
    setCreating(false);
  }
};
  return (
  <AdminLayout
    title="Recruiters"
    subtitle="Manage recruiter accounts, access and company information."
  >
    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
        {error}
      </div>
    )}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Recruiter Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage recruiter accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 shrink-0 px-5 rounded-xl bg-[#7393D3] text-white text-sm font-medium hover:bg-[#5E84D6] transition"
        >
          + Add Recruiter
        </button>
      </div>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Search recruiter by name, email or company..."
          filters={[
            {
              name: "status",
              value: status,
              onChange: setStatus,
              options: [
                {
                  value: "",
                  label: "All Status"
                },
                {
                  value: "active",
                  label: "Active"
                },
                {
                  value: "blocked",
                  label: "Blocked"
                }
              ]
            }
          ]}
        />
      <table className="w-full text-sm">
          <thead>
  <tr className="text-left text-gray-500 bg-gray-50">
    <th className="px-6 py-3 font-medium">
      Recruiter
    </th>
    <th className="px-6 py-3 font-medium">
      Company
    </th>
    <th className="px-6 py-3 font-medium">
      Email Address
    </th>
    <th className="px-6 py-3 font-medium">
      Jobs
    </th>
    <th className="px-6 py-3 font-medium">
      Applications
    </th>
    <th className="px-6 py-3 font-medium">
      Status
    </th>
    <th className="px-6 py-3 font-medium">
      Actions
    </th>
  </tr>
</thead>
<tbody>
  {loading && (
    <tr>
      <td
        colSpan={7}
        className="px-6 py-8 text-center text-gray-400"
      >
        Loading recruiters...
      </td>
    </tr>
  )}
  {!loading && data.recruiters.length === 0 && (
    <tr>
      <td
        colSpan={7}
        className="px-6 py-8 text-center text-gray-400"
      >
        No recruiters found
      </td>
    </tr>
  )}
  {!loading &&
    data.recruiters.map((recruiter) => (
      <tr
        key={recruiter.id}
        className="border-t border-gray-100"
      >
        <td className="px-6 py-3 text-gray-800">
          {recruiter.fullname}
        </td>
        <td className="px-6 py-3 text-gray-600">
          SHNOOR INTERNATIONAL LLC
        </td>
        <td className="px-6 py-3 text-gray-600">
          {recruiter.email}
        </td>
        <td className="px-6 py-3 text-gray-600">
          {recruiter.jobs_posted}
        </td>
        <td className="px-6 py-3 text-gray-600">
          {recruiter.applications_count}
        </td>
        <td className="px-6 py-3">
          <StatusBadge status={recruiter.is_blocked ? "Blocked" : "Active"} />
        </td>
        <td className="px-6 py-3">
          <ActionMenu
            items={[
              {
                key: "view",
                label: "View",
                onClick: () => handleView(recruiter.id)
              },
              {
                key: "block",
                label: recruiter.is_blocked ? "Unblock" : "Block",
                onClick: () =>
                  setConfirmAction({
                    type: recruiter.is_blocked
                      ? "unblock"
                      : "block",
                    id: recruiter.id,
                    name: recruiter.fullname
                  })
              },
              {
                key: "delete",
                label: "Delete",
                danger: true,
                onClick: () =>
                  setConfirmAction({
                    type: "delete",
                    id: recruiter.id,
                    name: recruiter.fullname
                  })
              }
            ]}
          />
        </td>
      </tr>
    ))}
</tbody>
</table>
<Pagination
  page={data.page}
  totalPages={data.totalPages}
  onChange={load}
/>
</div>
{viewRecruiter && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-xl font-bold text-[#3E3A74]">
          {viewRecruiter.fullname?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#3E3A74]">{viewRecruiter.fullname}</h3>
          <p className="text-sm text-gray-500">Recruiter</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="text-gray-500">Company:</span> SHNOOR INTERNATIONAL LLC</p>
        <p><span className="text-gray-500">Email:</span> {viewRecruiter.email}</p>
        <p><span className="text-gray-500">Phone:</span> {viewRecruiter.phone || "—"}</p>
        <p><span className="text-gray-500">Industry:</span> {viewRecruiter.industry || "Information Technology"}</p>
        <p><span className="text-gray-500">Headquarters:</span> {viewRecruiter.headquarters || "—"}</p>
        <p><span className="text-gray-500">Joined:</span> {formatDate(viewRecruiter.created_at)}</p>
        <p><span className="text-gray-500">Jobs Posted:</span> {viewRecruiter.jobs_posted}</p>
        <p><span className="text-gray-500">Applications:</span> {viewRecruiter.applications_count}</p>
        <p><span className="text-gray-500">Status:</span> {viewRecruiter.is_blocked ? "Blocked" : "Active"}</p>
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
{showAddModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="bg-gradient-to-r from-[#3E3A74] to-[#5B57A6] px-8 py-7">
        <h2 className="text-3xl font-bold text-white">
          Add Recruiter
        </h2>
        <p className="mt-2 text-white/80">
          Create a recruiter account
        </p>
      </div>
      <div className="space-y-6 p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Company
          </label>
          <input
            value="SHNOOR INTERNATIONAL LLC"
            disabled
            className="w-full rounded-xl border bg-gray-100 px-4 py-3 font-medium text-gray-600"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Recruiter Name
          </label>
          <input
            value={form.fullname}
            onChange={(e) =>
              setForm({
                ...form,
                fullname: e.target.value
              })
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#3E3A74] focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#3E3A74] focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Temporary Password
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-[#3E3A74] focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => {
                const password =
                  Math.random().toString(36).slice(-8) + "@123";
                setForm({
                  ...form,
                  password
                });
              }}
              className="rounded-xl bg-indigo-100 px-5 font-semibold text-[#3E3A74] hover:bg-indigo-200 transition"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 border-t bg-gray-50 px-8 py-5">
        <button
          onClick={() => setShowAddModal(false)}
          className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          disabled={creating}
          onClick={handleCreateRecruiter}
          className="rounded-xl bg-[#3E3A74] px-7 py-3 font-semibold text-white hover:bg-[#2d295c] transition disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Recruiter"}
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
      ? `This will permanently delete "${confirmAction?.name}" and all associated data.`
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
