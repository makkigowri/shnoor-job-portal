import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  sendAdminNotification,
  fetchNotificationHistory,
  deleteAdminNotification
} from "../../services/adminNotificationService";
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "—");
const AdminNotifications = () => {
  const [form, setForm] = useState({ title: "", message: "", type: "info", audience: "all" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await fetchNotificationHistory();
      setHistory(result.history);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notification history.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadHistory();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const result = await sendAdminNotification(form);
      setSuccess(`Notification sent to ${result.notification.recipient_count} recipient(s).`);
      setForm({ title: "", message: "", type: "info", audience: "all" });
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send notification.");
    } finally {
      setSending(false);
    }
  };
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAdminNotification(confirmDelete.id);
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notification.");
    } finally {
      setConfirmDelete(null);
    }
  };
  return (
    <AdminLayout title="Notifications" subtitle="Send announcements to users and recruiters, and review what has been sent.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-[#3E3A74] mb-4">Send Notification</h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Notification title"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Notification message"
              required
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Audience</label>
              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="jobseeker">Job Seekers Only</option>
                <option value="recruiter">Recruiters Only</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2.5 rounded-xl bg-[#7393D3] text-white font-medium hover:bg-[#5E84D6] disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#3E3A74]">Notification History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Audience</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Recipients</th>
              <th className="px-6 py-3 font-medium">Sent By</th>
              <th className="px-6 py-3 font-medium">Sent At</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading history...</td></tr>
            )}
            {!loading && history.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No notifications sent yet</td></tr>
            )}
            {!loading && history.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-6 py-3 text-gray-800">{item.title}</td>
                <td className="px-6 py-3 text-gray-600 capitalize">{item.audience}</td>
                <td className="px-6 py-3 text-gray-600 capitalize">{item.type}</td>
                <td className="px-6 py-3 text-gray-600">{item.recipient_count}</td>
                <td className="px-6 py-3 text-gray-600">{item.sent_by}</td>
                <td className="px-6 py-3 text-gray-600">{formatDateTime(item.created_at)}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => setConfirmDelete({ id: item.id, name: item.title })}
                    className="text-red-600 font-medium hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Notification"
        message={`This will remove "${confirmDelete?.name}" from the notification history.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </AdminLayout>
  );
};
export default AdminNotifications;
