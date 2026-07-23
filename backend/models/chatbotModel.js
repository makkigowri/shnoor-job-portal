const pool = require("../config/db");
const getActiveJobsCount = async () => {
  const result = await pool.query("SELECT COUNT(*)::int AS total FROM jobs WHERE status = 'Active'");
  return result.rows[0].total;
};
const getActiveJobsSummary = async (limit = 10) => {
  const query = `
    SELECT title, department, location, employment_type, experience, openings, status
    FROM jobs
    WHERE status = 'Active'
    ORDER BY created_at DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};
const getPublishedAssessmentsCount = async () => {
  const result = await pool.query("SELECT COUNT(*)::int AS total FROM assessments WHERE status = 'Published'");
  return result.rows[0].total;
};
const getPublishedAssessmentsSummary = async (limit = 10) => {
  const query = `
    SELECT a.title, a.duration_minutes, a.passing_marks, a.total_marks, j.title AS job_title
    FROM assessments a
    LEFT JOIN jobs j ON j.id = a.job_id
    WHERE a.status = 'Published'
    ORDER BY a.created_at DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};
module.exports = {
  getActiveJobsCount,
  getActiveJobsSummary,
  getPublishedAssessmentsCount,
  getPublishedAssessmentsSummary
};
