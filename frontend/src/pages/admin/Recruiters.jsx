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

    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">

      <div className="px-8 py-7 border-b bg-gradient-to-r from-white via-[#F8F8FD] to-[#EEF2FF]">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <h2 className="text-3xl font-bold text-[#3E3A74]">
              Recruiter Management
            </h2>

            <p className="mt-2 text-gray-500">
              Manage recruiter accounts
            </p>

          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#3E3A74] hover:bg-[#2f2b5d]
            text-white
            px-6
            py-3
            rounded-xl
            shadow-md
            font-semibold
            transition-all duration-300"
          >
            + Add Recruiter
          </button>

        </div>

      </div>

      <div className="px-8 pt-6">

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

      </div>

      <div className="px-8 pb-8 pt-6 overflow-x-auto">

        <table className="min-w-full">
          <thead>

  <tr className="bg-gradient-to-r from-[#F8F9FD] to-[#EEF2FF] border-b border-gray-200">

    <th className="px-7 py-4 text-left text-sm font-semibold text-gray-600">
      Recruiter
    </th>

    <th className="px-7 py-4 text-left text-sm font-semibold text-gray-600">
      Company
    </th>

    <th className="px-7 py-4 text-left text-sm font-semibold text-gray-600">
      Email Address
    </th>

    <th className="px-7 py-4 text-center text-sm font-semibold text-gray-600">
      Jobs
    </th>

    <th className="px-7 py-4 text-center text-sm font-semibold text-gray-600">
      Applications
    </th>

    <th className="px-7 py-4 text-center text-sm font-semibold text-gray-600">
      Status
    </th>

    <th className="px-7 py-4 text-center text-sm font-semibold text-gray-600">
      Actions
    </th>

  </tr>

</thead>

<tbody>

  {loading && (

    <tr>

      <td
        colSpan={7}
        className="py-16 text-center text-gray-500"
      >
        Loading recruiters...
      </td>

    </tr>

  )}

  {!loading && data.recruiters.length === 0 && (

    <tr>

      <td
        colSpan={7}
        className="py-16 text-center text-gray-400"
      >
        No recruiters found.
      </td>

    </tr>

  )}

  {!loading &&
    data.recruiters.map((recruiter) => (

      <tr
        key={recruiter.id}
        className="border-b border-gray-100 hover:bg-indigo-50 transition duration-300"
      >

        <td className="px-7 py-5">

          <div className="flex items-center gap-4">

            <div
              className="
              w-12
              h-12
              rounded-full
              bg-indigo-100
              text-[#3E3A74]
              flex
              items-center
              justify-center
              font-bold
              text-lg
              shadow-sm"
            >
              {recruiter.fullname?.charAt(0).toUpperCase()}
            </div>

            <div>

              <h3 className="font-semibold text-gray-800">
                {recruiter.fullname}
              </h3>

              <p className="text-xs text-gray-500">
                Recruiter
              </p>

            </div>

          </div>

        </td>

        <td className="px-7 py-5">

          <div>

            <h3 className="font-semibold text-gray-800">
              SHNOOR INTERNATIONAL LLC
            </h3>

            <p className="text-xs text-gray-500">
              Information Technology
            </p>

          </div>

        </td>

        <td className="px-7 py-5">

          <span className="text-gray-600">
            {recruiter.email}
          </span>

        </td>

        <td className="px-7 py-5 text-center">

          <div className="font-bold text-[#3E3A74] text-lg">

            {recruiter.jobs_posted}

          </div>

        </td>

        <td className="px-7 py-5 text-center">

          <div className="font-bold text-[#3E3A74] text-lg">

            {recruiter.applications_count}

          </div>

        </td>

        <td className="px-7 py-5 text-center">

          {recruiter.is_blocked ? (

            <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 px-4 py-2 text-xs font-semibold">

              Blocked

            </span>

          ) : (

            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-4 py-2 text-xs font-semibold">

              Active

            </span>

          )}

        </td>

        <td className="px-7 py-5 text-center">

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

<div className="border-t bg-gray-50 px-8 py-5">

  <Pagination
    page={data.page}
    totalPages={data.totalPages}
    onChange={load}
  />

</div>

</div>

</div>
{viewRecruiter && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

      <div className="bg-gradient-to-r from-[#3E3A74] to-[#5B57A6] px-8 py-8">

        <div className="flex items-center gap-5">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white">

            {viewRecruiter.fullname?.charAt(0).toUpperCase()}

          </div>

          <div>

            <h2 className="text-3xl font-bold text-white">

              {viewRecruiter.fullname}

            </h2>

            <p className="mt-1 text-white/80">

              Recruiter

            </p>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6 p-8">

        <div className="rounded-2xl border bg-gray-50 p-5">

          <p className="text-sm text-gray-500">

            Company

          </p>

          <p className="mt-2 font-semibold text-gray-800">

            SHNOOR INTERNATIONAL LLC

          </p>

        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">

          <p className="text-sm text-gray-500">

            Email

          </p>

          <p className="mt-2 font-semibold text-gray-800 break-all">

            {viewRecruiter.email}

          </p>

        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">

          <p className="text-sm text-gray-500">

            Phone

          </p>

          <p className="mt-2 font-semibold text-gray-800">

            {viewRecruiter.phone || "-"}

          </p>

        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">

          <p className="text-sm text-gray-500">

            Industry

          </p>

          <p className="mt-2 font-semibold text-gray-800">

            {viewRecruiter.industry || "Information Technology"}

          </p>

        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">

          <p className="text-sm text-gray-500">

            Headquarters

          </p>

          <p className="mt-2 font-semibold text-gray-800">

            {viewRecruiter.headquarters || "-"}

          </p>

        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">

          <p className="text-sm text-gray-500">

            Joined

          </p>

          <p className="mt-2 font-semibold text-gray-800">

            {formatDate(viewRecruiter.created_at)}

          </p>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-5 px-8 pb-8">

        <div className="rounded-2xl bg-indigo-50 p-6 text-center">

          <h2 className="text-3xl font-bold text-[#3E3A74]">

            {viewRecruiter.jobs_posted}

          </h2>

          <p className="mt-2 text-gray-500">

            Jobs Posted

          </p>

        </div>

        <div className="rounded-2xl bg-green-50 p-6 text-center">

          <h2 className="text-3xl font-bold text-green-600">

            {viewRecruiter.applications_count}

          </h2>

          <p className="mt-2 text-gray-500">

            Applications

          </p>

        </div>

        <div className="rounded-2xl bg-yellow-50 p-6 text-center">

          <h2 className="text-lg font-bold">

            {viewRecruiter.is_blocked ? "Blocked" : "Active"}

          </h2>

          <p className="mt-2 text-gray-500">

            Status

          </p>

        </div>

      </div>

      <div className="flex justify-end border-t bg-gray-50 px-8 py-5">

        <button
          onClick={() => setViewRecruiter(null)}
          className="rounded-xl bg-[#3E3A74] px-6 py-3 font-semibold text-white transition hover:bg-[#2d295c]"
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
            placeholder="Enter recruiter name"
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
            placeholder="example@shnoor.com"
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
              placeholder="Enter password"
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
