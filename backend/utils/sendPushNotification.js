const { messaging } = require("../config/firebaseAdmin");
const pool = require("../config/db");

const sendPushNotification = async (userId, title, body) => {
  try {
    const result = await pool.query(
      "SELECT fcm_token FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) return;

    const token = result.rows[0].fcm_token;

    if (!token) return;

    await messaging.send({
      token,
      notification: {
        title,
        body,
      },
    });

    console.log("✅ Push Notification Sent");
  } catch (err) {
    console.error("❌ Push Notification Error:", err.message);
  }
};

module.exports = sendPushNotification;