import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import NotificationTabs from "../../components/notifications/NotificationTabs";
import NotificationCard from "../../components/notifications/NotificationCard";
import { useNotificationInbox } from "../../hooks/useNotificationInbox";
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
    error,
    hasUnread,
    markingAll,
    markAllRead
  } = useNotificationInbox();
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-heading">Notifications</h1>
            <p className="text-body mt-2">Stay updated with your applications and profile activities.</p>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll || !hasUnread}
            className="border border-border px-5 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAll ? "Updating..." : "Mark All as Read"}
          </button>
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
          {activeNotifications.map((item) => (
            <NotificationCard key={item.id} item={item} theme={theme} />
          ))}
        </div>
      </div>
    </UserDashboardLayout>
  );
};
export default Notifications;