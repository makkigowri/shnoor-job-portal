import { useEffect, useMemo, useState } from "react";
import { Bell, UserCircle2, FileText, Briefcase, Building2, ClipboardCheck, Megaphone, Check } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Pagination from "../../components/admin/Pagination";
import usePagination from "../../hooks/usePagination";
import {
  fetchAdminActivity,
  markAdminActivityRead,
  markAdminActivityCategoryRead
} from "../../services/adminActivityService";
import { timeAgo } from "../../utils/timeAgo";
const FILTERS = [
  { key: "All", label: "All" },
  { key: "Unread", label: "Unread" },
  { key: "profile", label: "Profile" },
  { key: "applications", label: "Applications" },
  { key: "recruiters", label: "Recruiters" },
  { key: "jobs", label: "Jobs" },
  { key: "assessments", label: "Assessments" },
  { key: "announcement", label: "Announcements" }
];
const CATEGORY_META = {
  profile: { icon: UserCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  applications: { icon: FileText, color: "text-[#7393D3]", bg: "bg-[#EEF2FF]" },
  recruiters: { icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
  jobs: { icon: Briefcase, color: "text-teal-600", bg: "bg-teal-50" },
  assessments: { icon: ClipboardCheck, color: "text-rose-600", bg: "bg-rose-50" },
  announcement: { icon: Megaphone, color: "text-purple-600", bg: "bg-purple-50" }
};
const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await fetchAdminActivity();
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadNotifications();
  }, []);
  const handleMarkRead = async (item) => {
    if (item.isRead) return;
    setNotifications((prev) => prev.map((n) => (n.key === item.key ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    try {
      await markAdminActivityRead(item.key);
    } catch (err) {
      setNotifications((prev) => prev.map((n) => (n.key === item.key ? { ...n, isRead: false } : n)));
      setUnreadCount((prev) => prev + 1);
    }
  };
  const categoryUnreadCounts = useMemo(() => {
    const counts = {};
    notifications.forEach((item) => {
      if (!item.isRead) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });
    return counts;
  }, [notifications]);
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") return notifications;
    if (activeFilter === "Unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.category === activeFilter);
  }, [notifications, activeFilter]);
  const {
    page,
    setPage,
    totalPages,
    paginatedItems: pagedNotifications
  } = usePagination(filteredNotifications, 10);
  useEffect(() => {
    setPage(1);
  }, [activeFilter]);
  useEffect(() => {
    if (activeFilter === "All" || activeFilter === "Unread") return;
    const unreadInCategory = notifications.filter((n) => n.category === activeFilter && !n.isRead);
    if (unreadInCategory.length === 0) return;
    setNotifications((prev) =>
      prev.map((n) => (n.category === activeFilter && !n.isRead ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - unreadInCategory.length, 0));
    markAdminActivityCategoryRead(activeFilter).catch(() => {});
  }, [activeFilter, notifications]);
  return (
    <AdminLayout title="Notifications" subtitle="Stay updated with recent activity and important system events.">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#3E3A74]">Recent Activity</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-[#7393D3] text-white text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => {
              const count = categoryUnreadCounts[filter.key] || 0;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeFilter === filter.key
                      ? "bg-[#7393D3] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                  {count > 0 && ` (${count})`}
                </button>
              );
            })}
          </div>
        </div>
        {loading && (
          <div className="px-6 py-16 text-center text-gray-400">Loading notifications...</div>
        )}
        {!loading && filteredNotifications.length === 0 && (
          <div className="px-6 py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="text-gray-400" size={26} />
            </div>
            <h4 className="font-semibold text-[#3E3A74] mb-1">No notifications yet</h4>
            <p className="text-sm text-gray-500 max-w-sm">
              You're all caught up. New activity and important updates will appear here.
            </p>
          </div>
        )}
        {!loading && filteredNotifications.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {pagedNotifications.map((item) => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.announcement;
              const Icon = meta.icon;
              return (
                <li
                  key={item.key}
                  className={`px-6 py-4 flex items-start gap-4 transition ${
                    item.isRead ? "bg-white" : "bg-[#F5F7FF]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={20} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!item.isRead && <span className="w-2 h-2 rounded-full bg-[#7393D3] shrink-0" />}
                      <p className={`text-sm truncate ${item.isRead ? "font-medium text-gray-700" : "font-bold text-[#3E3A74]"}`}>
                        {item.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(item.occurredAt)}</p>
                  </div>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item)}
                      title="Mark as read"
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#3E3A74] transition shrink-0"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AdminLayout>
  );
};
export default AdminNotifications;
