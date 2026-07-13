const {getNotificationsByUser,getUnreadCount,markAsRead,markAllAsRead} = require("../models/notificationModel");
const listMyNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotificationsByUser(req.user.id);
    const unreadCount = await getUnreadCount(req.user.id);
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.user.id, req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const updated = await markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: `${updated} notification(s) marked as read` });
  } catch (error) {
    next(error);
  }
};
module.exports = { listMyNotifications, markNotificationRead, markAllNotificationsRead };
