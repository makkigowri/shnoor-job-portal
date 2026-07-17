const pool = require("../config/db");
const crypto = require("crypto");

const TI_SELECT = `
  SELECT ti.*, j.title AS job_title, j.location AS job_location,
    c.fullname AS candidate_name, c.email AS candidate_email, c.phone AS candidate_phone,
    r.fullname AS recruiter_name, r.email AS recruiter_email
  FROM technical_interviews ti
  JOIN jobs j ON j.id = ti.job_id
  JOIN users c ON c.id = ti.candidate_id
  JOIN users r ON r.id = ti.recruiter_id `;

const generateRoomCode = () => crypto.randomBytes(12).toString("hex");

const getEligibleApplicationsForRecruiter = async (recruiterId) => {
  const query = `
    SELECT ap.id AS application_id, ap.job_id, ap.user_id AS candidate_id, ap.status,
      j.title AS job_title, u.fullname AS candidate_name, u.email AS candidate_email,
      ai.id AS ai_interview_id, ai.overall_score, ai.decision
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    JOIN users u ON u.id = ap.user_id
    JOIN ai_interviews ai ON ai.application_id = ap.id
    LEFT JOIN technical_interviews ti ON ti.application_id = ap.id
    WHERE j.recruiter_id = $1
      AND ai.decision = 'Technical Interview'
      AND ai.status = 'Completed'
      AND ti.id IS NULL
    ORDER BY ai.completed_at DESC `;
  const result = await pool.query(query, [recruiterId]);
  return result.rows;
};

const scheduleTechnicalInterview = async (
  recruiterId,
  { applicationId, scheduledDate, scheduledTime, durationMinutes, notes }
) => {
  const appQuery = `
    SELECT ap.id, ap.job_id, ap.user_id, ai.id AS ai_interview_id
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    JOIN ai_interviews ai ON ai.application_id = ap.id
    WHERE ap.id = $1 AND j.recruiter_id = $2 AND ai.decision = 'Technical Interview' `;
  const appResult = await pool.query(appQuery, [applicationId, recruiterId]);
  const application = appResult.rows[0];
  if (!application) {
    return null;
  }
  const roomCode = generateRoomCode();
  const insertQuery = `
    INSERT INTO technical_interviews
      (application_id, ai_interview_id, job_id, candidate_id, recruiter_id, room_code,
       scheduled_date, scheduled_time, duration_minutes, notes, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Scheduled')
    ON CONFLICT (application_id) DO UPDATE SET
      scheduled_date = EXCLUDED.scheduled_date,
      scheduled_time = EXCLUDED.scheduled_time,
      duration_minutes = EXCLUDED.duration_minutes,
      notes = EXCLUDED.notes,
      status = 'Scheduled',
      updated_at = NOW()
    RETURNING * `;
  const values = [
    applicationId,
    application.ai_interview_id,
    application.job_id,
    application.user_id,
    recruiterId,
    roomCode,
    scheduledDate,
    scheduledTime,
    durationMinutes || 45,
    notes || null
  ];
  const result = await pool.query(insertQuery, values);
  await pool.query(
    `UPDATE applications SET status = 'Technical Interview Scheduled', updated_at = NOW() WHERE id = $1`,
    [applicationId]
  );
  return result.rows[0];
};

const getForRecruiter = async (recruiterId, { status } = {}) => {
  const values = [recruiterId];
  let query = `${TI_SELECT} WHERE ti.recruiter_id = $1`;
  if (status) {
    values.push(status);
    query += ` AND ti.status = $${values.length}`;
  }
  query += " ORDER BY ti.scheduled_date DESC, ti.scheduled_time DESC";
  const result = await pool.query(query, values);
  return result.rows;
};

const getForCandidate = async (candidateId) => {
  const result = await pool.query(
    `${TI_SELECT} WHERE ti.candidate_id = $1 ORDER BY ti.scheduled_date DESC, ti.scheduled_time DESC`,
    [candidateId]
  );
  return result.rows;
};

const getByIdForRecruiter = async (id, recruiterId) => {
  const result = await pool.query(`${TI_SELECT} WHERE ti.id = $1 AND ti.recruiter_id = $2`, [id, recruiterId]);
  return result.rows[0];
};

const getByIdForCandidate = async (id, candidateId) => {
  const result = await pool.query(`${TI_SELECT} WHERE ti.id = $1 AND ti.candidate_id = $2`, [id, candidateId]);
  return result.rows[0];
};

const getByRoomCode = async (roomCode) => {
  const result = await pool.query(`${TI_SELECT} WHERE ti.room_code = $1`, [roomCode]);
  return result.rows[0];
};

const markJoined = async (id, role) => {
  const column = role === "recruiter" ? "recruiter_joined_at" : "candidate_joined_at";
  const query = `
    UPDATE technical_interviews SET
      ${column} = COALESCE(${column}, NOW()),
      meeting_started_at = COALESCE(meeting_started_at, NOW()),
      status = CASE WHEN status = 'Scheduled' THEN 'In Progress' ELSE status END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING * `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const markMeetingEnded = async (id) => {
  const result = await pool.query(
    `UPDATE technical_interviews SET
      meeting_ended_at = NOW(),
      status = CASE WHEN status IN ('Scheduled', 'In Progress') THEN 'Awaiting Result' ELSE status END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING * `,
    [id]
  );
  return result.rows[0];
};

const updateResult = async (id, recruiterId, { result, feedback }) => {
  const query = `
    UPDATE technical_interviews SET
      result = $1,
      recruiter_feedback = $2,
      status = 'Completed',
      result_updated_at = NOW(),
      updated_at = NOW()
    WHERE id = $3 AND recruiter_id = $4
    RETURNING * `;
  const dbResult = await pool.query(query, [result, feedback || null, id, recruiterId]);
  return dbResult.rows[0];
};

const updateApplicationStatusForResult = async (applicationId, status) => {
  const result = await pool.query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING * `,
    [status, applicationId]
  );
  return result.rows[0];
};

const getAdminStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_scheduled,
      COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
      COUNT(*) FILTER (WHERE result = 'Selected') AS selected,
      COUNT(*) FILTER (WHERE result = 'Rejected') AS rejected
    FROM technical_interviews
  `);
  const row = result.rows[0];
  return {
    totalScheduled: Number(row.total_scheduled) || 0,
    completed: Number(row.completed) || 0,
    selected: Number(row.selected) || 0,
    rejected: Number(row.rejected) || 0
  };
};

module.exports = {
  generateRoomCode,
  getEligibleApplicationsForRecruiter,
  scheduleTechnicalInterview,
  getForRecruiter,
  getForCandidate,
  getByIdForRecruiter,
  getByIdForCandidate,
  getByRoomCode,
  markJoined,
  markMeetingEnded,
  updateResult,
  updateApplicationStatusForResult,
  getAdminStats
};
