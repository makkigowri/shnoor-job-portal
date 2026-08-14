const pool = require("../config/db");
const AUDIENCE_LABELS = {
  all: "Users & Recruiters",
  jobseeker: "Users",
  recruiter: "Recruiters"
};
const getRecipientIds = async (audience) => {
  if (audience === "jobseeker" || audience === "recruiter") {
    const result = await pool.query("SELECT id FROM users WHERE role = $1", [audience]);
    return result.rows.map((row) => row.id);
  }
  const result = await pool.query("SELECT id FROM users");
  return result.rows.map((row) => row.id);
};
const sendBroadcastAnnouncement = async (adminId, { message, audience = "all" }) => {
  const recipientIds = await getRecipientIds(audience);
  const notificationTitle = "Announcement";
  const logTitle = message.length > 200 ? `${message.slice(0, 197)}...` : message;
  const logQuery = `
    INSERT INTO admin_notifications (admin_id, title, message, type, audience, recipient_count)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`;
  const logResult = await pool.query(logQuery, [adminId, logTitle, message, "info", audience, recipientIds.length]);
  const announcement = logResult.rows[0];
  if (recipientIds.length > 0) {
    const values = [];
    const placeholders = recipientIds
      .map((userId, index) => {
        const base = index * 6;
        values.push(userId, notificationTitle, message, "announcement", announcement.id, announcement.created_at);
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
      })
      .join(", ");
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, announcement_id, created_at) VALUES ${placeholders}`,
      values
    );
  }
  return announcement;
};
const getAnnouncementHistory = async (limit = 50) => {
  const query = `
    SELECT an.*, a.fullname AS sent_by
    FROM admin_notifications an
    JOIN admins a ON a.id = an.admin_id
    ORDER BY an.created_at DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows.map((row) => ({ ...row, audience_label: AUDIENCE_LABELS[row.audience] || row.audience }));
};
const deleteAnnouncementHistoryEntry = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM notifications WHERE announcement_id = $1", [id]);
    const result = await client.query("DELETE FROM admin_notifications WHERE id = $1 RETURNING id", [id]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
module.exports = {
  AUDIENCE_LABELS,
  sendBroadcastAnnouncement,
  getAnnouncementHistory,
  deleteAnnouncementHistoryEntry
};
