import { useEffect, useState } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../../services/notificationService";
const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} Hour${diffHours > 1 ? "s" : ""} Ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} Days Ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getMyNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load notifications right now");
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(() => loadNotifications(false), 30000);
    return () => clearInterval(intervalId);
  }, []);
  const getBadge = (type) => {
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
  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this notification right now");
    }
  };
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setError("");
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to mark notifications as read right now");
    } finally {
      setMarkingAll(false);
    }
  };
  const hasUnread = notifications.some((item) => !item.is_read);
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-heading">
              Notifications
            </h1>
            <p className="text-body mt-2">
              Stay updated with your applications and profile activities.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll || !hasUnread}
            className="border border-border px-5 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAll ? "Updating..." : "Mark All as Read"}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-body">Loading notifications...</p>
        )}

        {!loading && notifications.length === 0 && !error && (
          <div className="bg-white border border-border rounded-xl p-12 text-center text-body shadow-sm">
            You have no notifications yet.
          </div>
        )}

        <div className="space-y-5">

          {notifications.map((item) => (

            <div
              key={item.id}
              onClick={() => !item.is_read && handleMarkRead(item.id)}
              className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer ${
                item.is_read ? "border-border" : "border-primary/40 bg-primary/5"
              }`}
            >
              <div className="flex justify-between items-start">

                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBadge(item.type)}`}
                    >
                      {(item.type || "info").toUpperCase()}
                    </div>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-heading">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-body leading-7">
                    {item.message}
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {formatTime(item.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserDashboardLayout>
  );
};
export default Notifications;
