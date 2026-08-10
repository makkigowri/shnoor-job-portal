import { useEffect } from "react";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import NotificationTabs from "../../components/notifications/NotificationTabs";
import NotificationCard from "../../components/notifications/NotificationCard";
import { useNotificationInbox } from "../../hooks/useNotificationInbox";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
const badgeColor = (type) => {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-700";
    case "warning":
      return "bg-yellow-100 text-yellow-700";
    case "error":
      return "bg-red-100 text-red-600";
    default:
      return "bg-blue-100 text-blue-700";
  }
};
const theme = {
  tabActive: "bg-[#7393D3] text-white",
  tabInactive: "border border-gray-200 text-gray-600 hover:bg-gray-50",
  badge: "bg-red-500 text-white",
  cardRounded: "rounded-2xl",
  readBorder: "border-gray-200",
  unreadBorder: "border-[#7393D3]/50",
  unreadBg: "bg-[#7393D3]/5",
  unreadDot: "bg-[#7393D3]",
  titleColor: "text-[#3E3A74]",
  bodyColor: "text-gray-500",
  badgeColor
};
export default function Notifications() {
  const {
    activeCategory,
    setActiveCategory,
    activeNotifications,
    unreadCounts,
    loading,
    error,
    hasUnread,
    markingAll,
    markAllRead
  } = useNotificationInbox();
  const { page, setPage, totalPages, paginatedItems: pagedNotifications } = usePagination(
    activeNotifications,
    8
  );
  useEffect(() => {
    setPage(1);
  }, [activeCategory]);
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Notifications</h1>
          <p className="mt-2 text-gray-500">Stay updated with recruitment activities.</p>
        </div>
        <button
          onClick={markAllRead}
          disabled={markingAll || !hasUnread}
          className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {markingAll ? "Updating..." : "Mark All as Read"}
        </button>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      <div className="mt-8">
        <NotificationTabs
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          unreadCounts={unreadCounts}
          theme={theme}
        />
      </div>
      {loading && <p className="mt-8 text-gray-500">Loading notifications...</p>}
      {!loading && activeNotifications.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No {activeCategory.toLowerCase()} notifications yet.
        </div>
      )}
      <div className="space-y-5 mt-8">
        {pagedNotifications.map((item) => (
          <NotificationCard key={item.id} item={item} theme={theme} />
        ))}
      </div>
      {activeNotifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-2">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </RecruiterDashboardLayout>
  );
}