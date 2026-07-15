const pool = require("../config/db");
const getResumeByUserId = async (userId) => {
  const query = `
    SELECT user_id, resume_path, resume_filename, resume_uploaded_at, resume_text FROM job_seeker_profiles WHERE user_id = $1 `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
const upsertResume = async (userId, resumePath, resumeFilename, resumeText = null) => {
  const query = `
    INSERT INTO job_seeker_profiles (user_id, resume_path, resume_filename, resume_uploaded_at, resume_text)
    VALUES ($1, $2, $3, NOW(), $4)
    ON CONFLICT (user_id) DO UPDATE SET
      resume_path = EXCLUDED.resume_path,
      resume_filename = EXCLUDED.resume_filename,
      resume_uploaded_at = NOW(),
      resume_text = EXCLUDED.resume_text
    RETURNING user_id, resume_path, resume_filename, resume_uploaded_at, resume_text
  `;
  const result = await pool.query(query, [userId, resumePath, resumeFilename, resumeText]);
  return result.rows[0];
};
const clearResume = async (userId) => {
  const query = `
    UPDATE job_seeker_profiles SET
      resume_path = NULL,
      resume_filename = NULL,
      resume_uploaded_at = NULL,
      resume_text = NULL
    WHERE user_id = $1
    RETURNING user_id, resume_path, resume_filename, resume_uploaded_at, resume_text
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
module.exports = {getResumeByUserId,upsertResume,clearResume};
