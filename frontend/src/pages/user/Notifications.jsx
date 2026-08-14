import { useEffect } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
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
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
};
const theme = {
  tabActive: "bg-primary text-white",
  tabInactive: "border border-border text-body hover:bg-gray-50",
  badge: "bg-red-500 text-white",
  cardRounded: "rounded-xl",
  readBorder: "border-border",
  unreadBorder: "border-primary/40",
  unreadBg: "bg-primary/5",
  unreadDot: "bg-primary",
  titleColor: "text-heading",
  bodyColor: "text-body",
  badgeColor
};
const Notifications = () => {
  const {
    activeCategory,
    setActiveCategory,
    activeNotifications,
    unreadCounts,
    loading,
    error
  } = useNotificationInbox();
  const { page, setPage, totalPages, paginatedItems: pagedNotifications } = usePagination(
    activeNotifications,
    8
  );
  useEffect(() => {
    setPage(1);
  }, [activeCategory]);
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">Notifications</h1>
          <p className="text-body mt-2">Stay updated with your applications and profile activities.</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">{error}</div>
        )}
        <NotificationTabs
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          unreadCounts={unreadCounts}
          theme={theme}
        />
        {loading && <p className="text-body">Loading notifications...</p>}
        {!loading && activeNotifications.length === 0 && !error && (
          <div className="bg-white border border-border rounded-xl p-12 text-center text-body shadow-sm">
            No {activeCategory.toLowerCase()} notifications yet.
          </div>
        )}
        <div className="space-y-5">
          {pagedNotifications.map((item) => (
            <NotificationCard key={item.id} item={item} theme={theme} />
          ))}
        </div>
        {activeNotifications.length > 0 && (
          <div className="bg-white border border-border rounded-xl shadow-sm">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};
export default Notifications;