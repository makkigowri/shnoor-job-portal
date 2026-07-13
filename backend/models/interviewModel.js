const pool = require("../config/db");
const INTERVIEW_SELECT = `
  SELECT iv.*,j.title AS job_title,j.location AS job_location,u.fullname AS candidate_name,u.email AS candidate_email,u.phone AS candidate_phone
  FROM interviews iv JOIN jobs j ON j.id = iv.job_id JOIN users u ON u.id = iv.candidate_id `;
const scheduleInterview = async (recruiterId, { applicationId, scheduledDate, scheduledTime, mode, locationOrLink, notes }) => {
  const appQuery = `
    SELECT ap.id, ap.job_id, ap.user_id FROM applications ap JOIN jobs j ON j.id = ap.job_id WHERE ap.id = $1 AND j.recruiter_id = $2 AND ap.status != 'Withdrawn' `;
  const appResult = await pool.query(appQuery, [applicationId, recruiterId]);
  const application = appResult.rows[0];
  if (!application) {
    return null;
  }
  const upsertQuery = `
    INSERT INTO interviews
      (application_id, job_id, candidate_id, recruiter_id, scheduled_date, scheduled_time, mode, location_or_link, notes, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Scheduled')
    ON CONFLICT (application_id) DO UPDATE SET
      scheduled_date = EXCLUDED.scheduled_date,scheduled_time = EXCLUDED.scheduled_time,mode = EXCLUDED.mode,location_or_link = EXCLUDED.location_or_link,notes = EXCLUDED.notes,status = 'Scheduled',updated_at = NOW()
    RETURNING * `;
  const values = [
    applicationId,application.job_id,application.user_id,recruiterId,scheduledDate,scheduledTime,mode || "Online",locationOrLink || null,notes || null
  ];
  const result = await pool.query(upsertQuery, values);
  await pool.query(
    `UPDATE applications SET status = 'Interview Scheduled', updated_at = NOW() WHERE id = $1`,
    [applicationId]
  );
  return result.rows[0];
};
const getInterviewsByRecruiter = async (recruiterId, filters = {}) => {
  const conditions = [`iv.recruiter_id = $1`];
  const values = [recruiterId];
  let idx = 2;
  if (filters.status) {
    conditions.push(`iv.status = $${idx}`); values.push(filters.status);
    idx += 1;
  }
  const query = `
    ${INTERVIEW_SELECT}
    WHERE ${conditions.join(" AND ")} ORDER BY iv.scheduled_date ASC, iv.scheduled_time ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};
const getInterviewsByCandidate = async (candidateId) => {
  const query = `
    ${INTERVIEW_SELECT}
    WHERE iv.candidate_id = $1
    ORDER BY iv.scheduled_date ASC, iv.scheduled_time ASC
  `;
  const result = await pool.query(query, [candidateId]);
  return result.rows;
};
const rescheduleInterview = async (interviewId, recruiterId, { scheduledDate, scheduledTime, mode, locationOrLink, notes }) => {
  const query = `
    UPDATE interviews SET
      scheduled_date = COALESCE($1, scheduled_date),scheduled_time = COALESCE($2, scheduled_time),mode = COALESCE($3, mode),location_or_link = COALESCE($4, location_or_link),notes = COALESCE($5, notes),status = 'Scheduled',updated_at = NOW()
    WHERE id = $6 AND recruiter_id = $7
    RETURNING * `;
  const result = await pool.query(query, [
    scheduledDate || null,scheduledTime || null,mode || null,locationOrLink || null,notes || null,interviewId,recruiterId]);
  return result.rows[0];
};
const updateInterviewStatus = async (interviewId, recruiterId, status) => {
  const query = `
    UPDATE interviews SET status = $1, updated_at = NOW()
    WHERE id = $2 AND recruiter_id = $3
    RETURNING * `;
  const result = await pool.query(query, [status, interviewId, recruiterId]);
  return result.rows[0];
};
const countUpcomingInterviewsForRecruiter = async (recruiterId) => {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM interviews
    WHERE recruiter_id = $1 AND status = 'Scheduled'
  `;
  const result = await pool.query(query, [recruiterId]);
  return result.rows[0].count;
};
module.exports = {scheduleInterview,getInterviewsByRecruiter,getInterviewsByCandidate,rescheduleInterview,updateInterviewStatus,countUpcomingInterviewsForRecruiter};
