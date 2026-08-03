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
    <AdminLayout title="Users" subtitle="Manage all registered job seekers.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                { value: "blocked", label: "Blocked" }
              ]
            }
          ]}
        />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created Date</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading users...</td></tr>
            )}
            {!loading && data.users.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
            )}
            {!loading && data.users.map((user) => (
              <tr key={user.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{user.fullname}</td>
                <td className="px-6 py-3 text-gray-600">{user.email}</td>
                <td className="px-6 py-3 text-gray-600">{user.phone}</td>
                <td className="px-6 py-3 text-gray-600 capitalize">{user.role}</td>
                <td className="px-6 py-3"><StatusBadge status={user.is_blocked ? "Blocked" : "Active"} /></td>
                <td className="px-6 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                <td className="px-6 py-3">
                  <ActionMenu
                    items={[
                      { key: "view", label: "View", onClick: () => handleView(user.id) },
                      {
                        key: "block",
                        label: user.is_blocked ? "Unblock" : "Block",
                        onClick: () =>
                          setConfirmAction({
                            type: user.is_blocked ? "unblock" : "block",
                            id: user.id,
                            name: user.fullname
                          })
                      },
                      {
                        key: "delete",
                        label: "Delete",
                        danger: true,
                        onClick: () => setConfirmAction({ type: "delete", id: user.id, name: user.fullname })
                      }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={data.page} totalPages={data.totalPages} onChange={load} />
      </div>
      {viewUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#3E3A74] mb-4">User Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {viewUser.fullname}</p>
              <p><span className="text-gray-500">Email:</span> {viewUser.email}</p>
              <p><span className="text-gray-500">Phone:</span> {viewUser.phone}</p>
              <p><span className="text-gray-500">Location:</span> {viewUser.location || "—"}</p>
              <p><span className="text-gray-500">Qualification:</span> {viewUser.qualification || "—"}</p>
              <p><span className="text-gray-500">Skills:</span> {viewUser.skills || "—"}</p>
              <p><span className="text-gray-500">Applications:</span> {viewUser.applications_count}</p>
              <p><span className="text-gray-500">Joined:</span> {formatDate(viewUser.created_at)}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewUser(null)}
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
        confirmLabel={confirmAction?.type === "delete" ? "Delete" : confirmAction?.type === "block" ? "Block" : "Unblock"}
        danger={confirmAction?.type === "delete" || confirmAction?.type === "block"}
        onConfirm={runConfirmed}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminLayout>
  );
};
export default AdminUsers;
