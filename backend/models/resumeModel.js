const pool = require("../config/db");
const getResumeByUserId = async (userId) => {
  const query = `
    SELECT user_id, resume_path, resume_filename, resume_uploaded_at FROM job_seeker_profiles WHERE user_id = $1 `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
const upsertResume = async (userId, resumePath, resumeFilename) => {
  const query = `
    INSERT INTO job_seeker_profiles (user_id, resume_path, resume_filename, resume_uploaded_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      resume_path = EXCLUDED.resume_path,
      resume_filename = EXCLUDED.resume_filename,
      resume_uploaded_at = NOW()
    RETURNING user_id, resume_path, resume_filename, resume_uploaded_at
  `;
  const result = await pool.query(query, [userId, resumePath, resumeFilename]);
  return result.rows[0];
};
const clearResume = async (userId) => {
  const query = `
    UPDATE job_seeker_profiles SET
      resume_path = NULL,
      resume_filename = NULL,
      resume_uploaded_at = NULL
    WHERE user_id = $1
    RETURNING user_id, resume_path, resume_filename, resume_uploaded_at
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
module.exports = {getResumeByUserId,upsertResume,clearResume};