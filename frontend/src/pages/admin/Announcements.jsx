import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import ActionMenu from "../../components/admin/ActionMenu";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AnnouncementMessageCell from "../../components/admin/AnnouncementMessageCell";
import {
  sendAdminAnnouncement,
  fetchAnnouncementHistory,
  deleteAdminAnnouncement
} from "../../services/adminAnnouncementService";

const AUDIENCE_OPTIONS = [
  { value: "jobseeker", label: "Users" },
  { value: "recruiter", label: "Recruiters" },
  { value: "all", label: "Users & Recruiters" }
];
const formatSentAt = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(value));
};
const AdminAnnouncements = () => {
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const result = await fetchAnnouncementHistory();
      setHistory(result.history || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load sent announcements.");
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    loadHistory();
  }, []);
  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!message.trim()) {
      setError("Please enter an announcement message.");
      return;
    }
    setSending(true);
    try {
      await sendAdminAnnouncement({ message: message.trim(), audience });
      setSuccess("Announcement sent successfully.");
      setMessage("");
      setAudience("all");
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send announcement. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAdminAnnouncement(deleteTarget.id);
      setSuccess("Announcement deleted successfully.");
      setHistory((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete announcement. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };
  return (
    <AdminLayout
      title="Announcements"
      subtitle="Send important updates and messages to users and recruiters."
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Megaphone size={20} className="text-[#7393D3]" />
          </div>
          <div>
            <h3 className="font-bold text-[#3E3A74]">New Announcement</h3>
            <p className="text-sm text-gray-500">This will be delivered to recipients' Notifications.</p>
          </div>
        </div>
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement message..."
              required
              rows={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Send To</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2.5 rounded-xl bg-[#7393D3] text-white font-medium hover:bg-[#5E84D6] disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Announcement"}
          </button>
        </form>
      </div>
      <div className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-[#3E3A74]">Sent Announcements</h3>
          <p className="text-sm text-gray-500 mt-1">A history of announcements sent from this page.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Message</th>
              <th className="px-6 py-3 font-medium">Sent At</th>
              <th className="px-6 py-3 font-medium">Sent To</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Loading announcements...
                </td>
              </tr>
            )}
            {!historyLoading && history.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No announcements sent yet
                </td>
              </tr>
            )}
            {!historyLoading &&
              history.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 align-top">
                  <td className="px-6 py-4">
                    <AnnouncementMessageCell message={item.message} />
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatSentAt(item.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border bg-[#EEF2FF] text-[#3E3A74] border-[#7393D3]/30">
                      {item.audience_label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ActionMenu
                      items={[
                        {
                          key: "delete",
                          label: "Delete",
                          danger: true,
                          onClick: () => setDeleteTarget(item)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Announcement?"
        message="Are you sure you want to delete this announcement? This action will also remove the announcement from the Notifications of the selected recipients."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </AdminLayout>
  );
};
export default AdminAnnouncements;
