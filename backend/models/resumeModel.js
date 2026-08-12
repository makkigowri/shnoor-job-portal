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
const getUserResumes = async (userId) => {
  const result = await pool.query(
    `SELECT id,
            user_id,
            resume_filename AS resume_name,
            resume_path,
            resume_filename,
            TRUE AS is_default,
            uploaded_at
     FROM user_resumes
     WHERE user_id = $1
     ORDER BY uploaded_at DESC`,
    [userId]
  );

  return result.rows;
};
const getUserResumeById = async (resumeId, userId) => {
  const result = await pool.query(
    `SELECT id,
            user_id,
            resume_filename AS resume_name,
            resume_path,
            resume_filename,
            resume_text,
            TRUE AS is_default,
            uploaded_at
     FROM user_resumes
     WHERE id = $1 AND user_id = $2`,
    [resumeId, userId]
  );

  return result.rows[0];
};
const countUserResumes = async (userId) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM user_resumes WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0].count;
};
const addUserResume = async (userId, { resumeName, resumePath, resumeFilename, resumeText, isDefault }) => {
  const result = await pool.query(
    `INSERT INTO user_resumes (user_id, resume_filename, resume_path, resume_text, uploaded_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id,
               user_id,
               resume_filename AS resume_name,
               resume_path,
               resume_filename,
               TRUE AS is_default,
               uploaded_at`,
    [userId, resumeFilename || resumeName, resumePath, resumeText || null]
  );
  return result.rows[0];
};
const replaceUserResume = async (resumeId, userId, { resumePath, resumeFilename, resumeText }) => {
  const result = await pool.query(
    `UPDATE user_resumes SET
       resume_path = $1,
       resume_filename = $2,
       resume_text = $3,
       uploaded_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING id,
               user_id,
               resume_filename AS resume_name,
               resume_path,
               resume_filename,
               TRUE AS is_default,
               uploaded_at`,
    [resumePath, resumeFilename, resumeText || null, resumeId, userId]
  );

  return result.rows[0];
};
const setDefaultUserResume = async (resumeId, userId) => {
  const result = await pool.query(
    `SELECT id,
            user_id,
            resume_filename AS resume_name,
            resume_path,
            resume_filename,
            TRUE AS is_default,
            uploaded_at
     FROM user_resumes
     WHERE id = $1 AND user_id = $2`,
    [resumeId, userId]
  );

  return result.rows[0];
};
const deleteUserResume = async (resumeId, userId) => {
  const result = await pool.query(
    `DELETE FROM user_resumes
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [resumeId, userId]
  );

  return result.rows[0];
};
const promoteMostRecentAsDefault = async (userId) => {
  const result = await pool.query(
    `SELECT id,
            user_id,
            resume_filename AS resume_name,
            resume_path,
            resume_filename,
            TRUE AS is_default,
            uploaded_at
     FROM user_resumes
     WHERE user_id = $1
     ORDER BY uploaded_at DESC
     LIMIT 1`,
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  getResumeByUserId,
  upsertResume,
  clearResume,
  getUserResumes,
  getUserResumeById,
  countUserResumes,
  addUserResume,
  replaceUserResume,
  setDefaultUserResume,
  deleteUserResume,
  promoteMostRecentAsDefault
};