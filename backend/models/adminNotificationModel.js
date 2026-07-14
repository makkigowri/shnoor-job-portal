const pool = require("../config/db");
const getRecipientIds = async (audience) => {
  if (audience === "jobseeker" || audience === "recruiter") {
    const result = await pool.query("SELECT id FROM users WHERE role = $1", [audience]);
    return result.rows.map((row) => row.id);
  }
  const result = await pool.query("SELECT id FROM users");
  return result.rows.map((row) => row.id);
};
const sendBroadcastNotification = async (adminId, { title, message, type = "info", audience = "all" }) => {
  const recipientIds = await getRecipientIds(audience);
  if (recipientIds.length > 0) {
    const values = [];
    const placeholders = recipientIds
      .map((userId, index) => {
        const base = index * 4;
        values.push(userId, title, message, type);
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
      })
      .join(", ");
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ${placeholders}`,
      values
    );
  }
  const logQuery = `
    INSERT INTO admin_notifications (admin_id, title, message, type, audience, recipient_count)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`;
  const logResult = await pool.query(logQuery, [adminId, title, message, type, audience, recipientIds.length]);
  return logResult.rows[0];
};
const getNotificationHistory = async (limit = 50) => {
  const query = `
    SELECT an.*, a.fullname AS sent_by
    FROM admin_notifications an
    JOIN admins a ON a.id = an.admin_id
    ORDER BY an.created_at DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};
const deleteNotificationHistoryEntry = async (id) => {
  const query = `DELETE FROM admin_notifications WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
module.exports = { sendBroadcastNotification, getNotificationHistory, deleteNotificationHistoryEntry };
