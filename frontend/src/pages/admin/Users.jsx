import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import ActionMenu from "../../components/admin/ActionMenu";
import { fetchUsers, blockUser, unblockUser, deleteUser, fetchUserById } from "../../services/adminUserService";
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const AdminUsers = () => {
  const [data, setData] = useState({ users: [], page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchUsers({ search, status, page, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users.");
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
      const result = await fetchUserById(id);
      setViewUser(result.user);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load user details.");
    }
  };
  const runConfirmed = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "block") await blockUser(confirmAction.id);
      if (confirmAction.type === "unblock") await unblockUser(confirmAction.id);
      if (confirmAction.type === "delete") await deleteUser(confirmAction.id);
      await load(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setConfirmAction(null);
    }
  };
  return (
  <AdminLayout
    title="Users"
    subtitle="Manage all registered job seekers."
  >
    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    )}

    <div className="rounded-3xl border border-gray-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-visible">

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Search by name, email or phone..."
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

      <div className="overflow-x-auto">

        <table className="w-full text-sm border-separate border-spacing-0">

          <thead>
            <tr className="bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] text-left text-gray-600">

              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Phone</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created Date</th>
              <th className="px-6 py-4 font-semibold text-center">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="py-16"
                >
                  <div className="flex items-center justify-center gap-3 text-[#7393D3]">

                    <div className="h-5 w-5 rounded-full border-[3px] border-[#7393D3]/30 border-t-[#7393D3] animate-spin"></div>

                    <span className="font-medium">
                      Loading users...
                    </span>

                  </div>
                </td>
              </tr>
            )}

            {!loading && data.users.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-16"
                >
                  <div className="flex flex-col items-center">

                    <div className="mb-4 h-16 w-16 rounded-full bg-[#EEF1FB] flex items-center justify-center text-2xl">
                      👥
                    </div>

                    <h4 className="font-semibold text-[#3E3A74]">
                      No Users Found
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing the search or filters.
                    </p>

                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              data.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 transition-all duration-300 hover:bg-[#EEF1FB]/40"
                >
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF1FB] text-[#7393D3] font-bold shadow-sm">
                        {user.fullname?.charAt(0).toUpperCase()}
                      </div>

                      <span className="font-semibold text-[#3E3A74]">
                        {user.fullname}
                      </span>

                    </div>

                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {user.phone}
                  </td>

                  <td className="px-6 py-4 capitalize text-gray-600">
                    {user.role}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge
                      status={user.is_blocked ? "Blocked" : "Active"}
                    />
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(user.created_at)}
                  </td>

                  <td className="px-6 py-4 flex justify-center">
                    <ActionMenu
                      items={[
                        {
                          key: "view",
                          label: "View",
                          onClick: () => handleView(user.id),
                        },
                        {
                          key: "block",
                          label: user.is_blocked
                            ? "Unblock"
                            : "Block",
                          onClick: () =>
                            setConfirmAction({
                              type: user.is_blocked
                                ? "unblock"
                                : "block",
                              id: user.id,
                              name: user.fullname,
                            }),
                        },
                        {
                          key: "delete",
                          label: "Delete",
                          danger: true,
                          onClick: () =>
                            setConfirmAction({
                              type: "delete",
                              id: user.id,
                              name: user.fullname,
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

      <div className="border-t border-gray-100 bg-white px-2 py-3">
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={load}
        />
      </div>

    </div>
        {viewUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-visible animate-[fadeIn_.2s_ease]">

          <div className="bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7393D3]/10 text-[#7393D3] text-xl font-bold shadow-sm">
                {viewUser.fullname?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#3E3A74]">
                  User Details
                </h3>

                <p className="text-sm text-gray-500">
                  Complete information about this user
                </p>
              </div>

            </div>
          </div>

          <div className="p-6">

            <div className="grid grid-cols-1 gap-4">

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Full Name
                </p>
                <p className="mt-1 font-semibold text-[#3E3A74]">
                  {viewUser.fullname}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <p className="mt-1 text-gray-700 break-all">
                  {viewUser.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Phone
                  </p>
                  <p className="mt-1 text-gray-700">
                    {viewUser.phone || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Applications
                  </p>
                  <p className="mt-1 font-semibold text-[#3E3A74]">
                    {viewUser.applications_count}
                  </p>
                </div>

              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Location
                </p>
                <p className="mt-1 text-gray-700">
                  {viewUser.location || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Qualification
                </p>
                <p className="mt-1 text-gray-700">
                  {viewUser.qualification || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Skills
                </p>
                <p className="mt-1 text-gray-700 leading-6">
                  {viewUser.skills || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF1FB]/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Joined On
                </p>
                <p className="mt-1 text-gray-700">
                  {formatDate(viewUser.created_at)}
                </p>
              </div>

            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="rounded-xl bg-[#7393D3] px-6 py-2.5 font-medium text-white transition-all duration-300 hover:bg-[#5E84D6] hover:shadow-lg hover:-translate-y-0.5"
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
          ? "Delete User"
          : confirmAction?.type === "block"
          ? "Block User"
          : "Unblock User"
      }
      message={
        confirmAction?.type === "delete"
          ? `This will permanently delete "${confirmAction?.name}" and all their data. This cannot be undone.`
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
export default AdminUsers;
