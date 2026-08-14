const {
  sendBroadcastAnnouncement,
  getAnnouncementHistory,
  deleteAnnouncementHistoryEntry
} = require("../models/adminAnnouncementModel");
const VALID_AUDIENCES = ["all", "jobseeker", "recruiter"];
const sendAnnouncement = async (req, res, next) => {
  try {
    const { message, audience } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Announcement message is required" });
    }
    if (audience && !VALID_AUDIENCES.includes(audience)) {
      return res.status(400).json({ success: false, message: "Invalid audience selected" });
    }
    const log = await sendBroadcastAnnouncement(req.admin.id, {
      message: message.trim(),
      audience: audience || "all"
    });
    res.status(201).json({ success: true, message: "Announcement sent successfully.", announcement: log, notification: log });
  } catch (error) {
    next(error);
  }
};
const listAnnouncementHistory = async (req, res, next) => {
  try {
    const history = await getAnnouncementHistory(50);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
};
const deleteAnnouncement = async (req, res, next) => {
  try {
    const deleted = await deleteAnnouncementHistoryEntry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, message: "Announcement deleted successfully." });
  } catch (error) {
    next(error);
  }
};
module.exports = { sendAnnouncement, listAnnouncementHistory, deleteAnnouncement };
