const pool = require("../config/db");
const createTicket = async (userId, subject = null) => {
  const query = `
    INSERT INTO support_tickets
    (user_id, subject, status)
    VALUES ($1, $2, 'Open')
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, subject]);
  return rows[0];
};
const getActiveTicket = async (userId) => {
  const query = `
    SELECT *
    FROM support_tickets
    WHERE user_id = $1
    AND status IN ('Open', 'In Progress')
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};
const createMessage = async (
  ticketId,
  senderType,
  senderId,
  message
) => {
  const query = `
    INSERT INTO support_messages
    (ticket_id, sender_type, sender_id, message)
    VALUES ($1,$2,$3,$4)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    ticketId,
    senderType,
    senderId,
    message,
  ]);
  return rows[0];
};
const getUserTickets = async (userId) => {
  const query = `
    SELECT *
    FROM support_tickets
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};
const getAllTickets = async () => {
  const query = `
    SELECT
      st.id,
      st.user_id,
      st.subject,
      st.status,
      st.created_at,
      st.updated_at,
      st.resolved_at,
      u.fullname,
      u.email,
      (
        SELECT message
        FROM support_messages sm
        WHERE sm.ticket_id = st.id
        ORDER BY sm.created_at DESC
        LIMIT 1
      ) AS last_message
    FROM support_tickets st
    JOIN users u
      ON st.user_id = u.id
    ORDER BY st.created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};
const getTicketById = async (ticketId) => {
  const query = `
    SELECT *
    FROM support_tickets
    WHERE id = $1;
  `;
  const { rows } = await pool.query(query, [ticketId]);
  return rows[0];
};
const getTicketMessages = async (ticketId) => {
  const query = `
    SELECT *
    FROM support_messages
    WHERE ticket_id = $1
    ORDER BY created_at ASC;
  `;
  const { rows } = await pool.query(query, [ticketId]);
  return rows;
};
const updateTicketStatus = async (ticketId, status) => {
  const query = `
    UPDATE support_tickets
    SET
      status = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    status,
    ticketId,
  ]);
  return rows[0];
};
const submitFeedback = async (
  ticketId,
  userId,
  rating,
  responseSpeed,
  platformRating,
  comments
) => {
  const query = `
    INSERT INTO support_feedback
    (
      ticket_id,
      user_id,
      rating,
      response_speed,
      platform_rating,
      comments
    )
    VALUES
    ($1,$2,$3,$4,$5,$6)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    ticketId,
    userId,
    rating,
    responseSpeed,
    platformRating,
    comments,
  ]);
  return rows[0];
};
const getAnalytics = async () => {
  const summary = await pool.query(`
  SELECT
    (SELECT COUNT(*) FROM support_tickets) AS total_tickets,
    (SELECT COUNT(*) FROM support_tickets
      WHERE status = 'Open') AS open_tickets,
    (SELECT COUNT(*) FROM support_tickets
      WHERE status = 'Resolved') AS resolved_tickets,
    (
      SELECT ROUND(COALESCE(AVG(rating), 0), 1)
      FROM support_feedback
    ) AS average_rating;
`);
  const ratingDistribution = await pool.query(`
    SELECT
      rating,
      COUNT(*) AS total
    FROM support_feedback
    GROUP BY rating
    ORDER BY rating DESC;
  `);
  const recentFeedback = await pool.query(`
    SELECT
      sf.id,
      sf.rating,
      sf.comments,
      sf.created_at,
      u.fullname,
      u.email
    FROM support_feedback sf
    LEFT JOIN users u
      ON sf.user_id = u.id
    ORDER BY sf.created_at DESC
    LIMIT 10;
  `);
  return {
    summary: summary.rows[0],
    ratingDistribution: ratingDistribution.rows,
    recentFeedback: recentFeedback.rows,
  };
};
const resolveSupportConversation = async (conversationId) => {
  const result = await pool.query(
    `
      UPDATE support_tickets
      SET
        status = 'Resolved',
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `,
    [conversationId]
  );
  return result.rows[0];
};
const deleteTicket = async (ticketId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM support_feedback WHERE ticket_id = $1;`,
      [ticketId]
    );
    await client.query(
      `DELETE FROM support_messages WHERE ticket_id = $1;`,
      [ticketId]
    );
    const { rows } = await client.query(
      `DELETE FROM support_tickets WHERE id = $1 RETURNING *;`,
      [ticketId]
    );
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const saveResolutionFeedback = async (ticketId, userId, resolutionFeedback) => {
  const query = `
    UPDATE support_tickets
    SET
      resolution_feedback = $1,
      resolution_feedback_at = NOW(),
      updated_at = NOW()
    WHERE id = $2
    AND user_id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    resolutionFeedback,
    ticketId,
    userId,
  ]);
  return rows[0];
};

module.exports = {
  createTicket,
  getActiveTicket,
  createMessage,
  getUserTickets,
  getAllTickets,
  getTicketById,
  getTicketMessages,
  updateTicketStatus,
  submitFeedback,
  getAnalytics,
  resolveSupportConversation,
  deleteTicket,
  saveResolutionFeedback
};