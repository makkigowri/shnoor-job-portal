import { useEffect, useMemo, useState } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../services/notificationService";
import {
  NOTIFICATION_CATEGORIES,
  groupNotificationsByCategory,
  getUnreadCountsByCategory
} from "../utils/notificationCategories";
export const useNotificationInbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState(NOTIFICATION_CATEGORIES[0]);
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
  const markRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this notification right now");
    }
  };
  const markAllRead = async () => {
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
  const grouped = useMemo(() => groupNotificationsByCategory(notifications), [notifications]);
  const unreadCounts = useMemo(() => getUnreadCountsByCategory(notifications), [notifications]);
  const hasUnread = notifications.some((item) => !item.is_read);
  const activeNotifications = grouped[activeCategory] || [];
  useEffect(() => {
    const unreadInView = activeNotifications.filter((item) => !item.is_read);
    if (unreadInView.length === 0) return;
    setNotifications((prev) =>
      prev.map((item) => (unreadInView.some((u) => u.id === item.id) ? { ...item, is_read: true } : item))
    );
    unreadInView.forEach((item) => {
      markNotificationAsRead(item.id).catch(() => {});
    });
  }, [activeCategory, notifications]);
  return {
    notifications,
    grouped,
    unreadCounts,
    activeCategory,
    setActiveCategory,
    activeNotifications,
    loading,
    error,
    hasUnread,
    markingAll,
    markRead,
    markAllRead
  };
};