const {
  sendBroadcastNotification,
  getNotificationHistory,
  deleteNotificationHistoryEntry
} = require("../models/adminNotificationModel");
const sendNotification = async (req, res, next) => {
  try {
    const { title, message, type, audience } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Notification title is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Notification message is required" });
    }
    const log = await sendBroadcastNotification(req.admin.id, { title, message, type, audience });
    res.status(201).json({ success: true, message: "Notification sent successfully", notification: log });
  } catch (error) {
    next(error);
  }
};
const listNotificationHistory = async (req, res, next) => {
  try {
    const history = await getNotificationHistory(50);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
};
const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await deleteNotificationHistoryEntry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Notification removed from history" });
  } catch (error) {
    next(error);
  }
};
module.exports = { sendNotification, listNotificationHistory, deleteNotification };
