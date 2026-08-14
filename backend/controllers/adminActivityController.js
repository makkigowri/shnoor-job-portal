const {
  getRecentAdminActivity,
  getReadActivityKeys,
  markActivityKeyRead,
  markActivityKeysRead
} = require("../models/adminActivityModel");
const listActivity = async (req, res, next) => {
  try {
    const [activity, readKeys] = await Promise.all([
      getRecentAdminActivity(),
      getReadActivityKeys(req.admin.id)
    ]);
    const notifications = activity.map((item) => ({
      ...item,
      isRead: readKeys.has(item.key)
    }));
    const unreadCount = notifications.filter((item) => !item.isRead).length;
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};
const markRead = async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: "Notification key is required" });
    }
    await markActivityKeyRead(req.admin.id, key);
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};
const markAllRead = async (req, res, next) => {
  try {
    const activity = await getRecentAdminActivity();
    const keys = activity.map((item) => item.key);
    await markActivityKeysRead(req.admin.id, keys);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
const markCategoryRead = async (req, res, next) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    const activity = await getRecentAdminActivity();
    const keys = activity.filter((item) => item.category === category).map((item) => item.key);
    await markActivityKeysRead(req.admin.id, keys);
    res.status(200).json({ success: true, message: `${category} notifications marked as read` });
  } catch (error) {
    next(error);
  }
};
module.exports = { listActivity, markRead, markAllRead, markCategoryRead };
