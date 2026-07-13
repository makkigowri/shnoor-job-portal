const pool = require("../config/db");
const saveJob = async (userId, jobId) => {
  const query = ` INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT (user_id, job_id) DO NOTHING RETURNING * `;
  const result = await pool.query(query, [userId, jobId]);
  return result.rows[0];
};
const removeSavedJob = async (userId, jobId) => {
  const query = `DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2 RETURNING id`;
  const result = await pool.query(query, [userId, jobId]);
  return result.rows[0];
};
const isJobSaved = async (userId, jobId) => {
  const query = `SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2`;
  const result = await pool.query(query, [userId, jobId]);
  return !!result.rows[0];
};
const getSavedJobsByUser = async (userId) => {
  const query = `
    SELECT
      sj.id AS saved_id,sj.created_at AS saved_at,j.*,u.fullname AS recruiter_name,
      c.company_name,c.logo_path AS company_logo,c.website AS company_website,c.industry AS company_industry,
      c.headquarters AS company_headquarters,c.description AS company_description,ap.status AS application_status
    FROM saved_jobs sj JOIN jobs j ON j.id = sj.job_id JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id LEFT JOIN applications ap ON ap.job_id = j.id AND ap.user_id = sj.user_id WHERE sj.user_id = $1
    ORDER BY sj.created_at DESC `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};
module.exports = { saveJob, removeSavedJob, isJobSaved, getSavedJobsByUser};