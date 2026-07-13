const pool = require("../config/db");
const createNotification = async (userId, { title, message, type = "info", relatedJobId = null }) => {
  const query = `
    INSERT INTO notifications (user_id, title, message, type, related_job_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const result = await pool.query(query, [userId, title, message, type, relatedJobId]);
  return result.rows[0];
};
const getNotificationsByUser = async (userId) => {
  const query = `
    SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`;
  const result = await pool.query(query, [userId]);
  return result.rows;
};
const getUnreadCount = async (userId) => {
  const query = `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`;
  const result = await pool.query(query, [userId]);
  return result.rows[0].count;
};
const markAsRead = async (userId, notificationId) => {
  const query = ` UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING * `;
  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0];
};
const markAllAsRead = async (userId) => {
  const query = `
    UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING id `;
  const result = await pool.query(query, [userId]);
  return result.rows.length;
};
module.exports = {createNotification,getNotificationsByUser,getUnreadCount,markAsRead,markAllAsRead};
