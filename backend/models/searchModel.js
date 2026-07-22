const pool = require("../config/db");

const searchAvailableJobsForCandidate = async (keywordPattern, limit) => {
  const query = `
    SELECT j.id, j.title, j.location, j.employment_type
    FROM jobs j
    WHERE j.status = 'Active'
      AND (j.title ILIKE $1 OR j.skills ILIKE $1 OR j.location ILIKE $1 OR j.department ILIKE $1)
    ORDER BY j.created_at DESC
    LIMIT $2`;
  const result = await pool.query(query, [keywordPattern, limit]);
  return result.rows;
};

const searchAppliedJobsForCandidate = async (candidateId, keywordPattern, limit) => {
  const query = `
    SELECT ap.id, j.id AS job_id, j.title, ap.status
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    WHERE ap.user_id = $1 AND ap.status != 'Withdrawn'
      AND (j.title ILIKE $2 OR ap.status ILIKE $2)
    ORDER BY ap.applied_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [candidateId, keywordPattern, limit]);
  return result.rows;
};

const searchSavedJobsForCandidate = async (candidateId, keywordPattern, limit) => {
  const query = `
    SELECT sj.id, j.id AS job_id, j.title, j.location
    FROM saved_jobs sj
    JOIN jobs j ON j.id = sj.job_id
    WHERE sj.user_id = $1 AND j.title ILIKE $2
    ORDER BY sj.created_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [candidateId, keywordPattern, limit]);
  return result.rows;
};

const searchAssessmentsForCandidate = async (candidateId, keywordPattern, limit) => {
  const query = `
    SELECT aa.id AS assignment_id, a.title, aa.status
    FROM assessment_assignments aa
    JOIN assessments a ON a.id = aa.assessment_id
    WHERE aa.candidate_id = $1 AND a.title ILIKE $2
    ORDER BY aa.assigned_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [candidateId, keywordPattern, limit]);
  return result.rows;
};

const searchProfileForCandidate = async (candidateId, keywordPattern) => {
  const query = `
    SELECT user_id, location, qualification, specialization, skills, about
    FROM job_seeker_profiles
    WHERE user_id = $1
      AND (qualification ILIKE $2 OR specialization ILIKE $2 OR skills ILIKE $2 OR about ILIKE $2 OR location ILIKE $2)
    LIMIT 1`;
  const result = await pool.query(query, [candidateId, keywordPattern]);
  return result.rows;
};

const searchNotificationsForUser = async (userId, keywordPattern, limit) => {
  const query = `
    SELECT id, title, message, type, created_at
    FROM notifications
    WHERE user_id = $1 AND (title ILIKE $2 OR message ILIKE $2)
    ORDER BY created_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [userId, keywordPattern, limit]);
  return result.rows;
};

const searchPostedJobsForRecruiter = async (recruiterId, keywordPattern, limit) => {
  const query = `
    SELECT id, title, location, status
    FROM jobs
    WHERE recruiter_id = $1
      AND (title ILIKE $2 OR skills ILIKE $2 OR location ILIKE $2 OR department ILIKE $2)
    ORDER BY created_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [recruiterId, keywordPattern, limit]);
  return result.rows;
};

const searchApplicationsForRecruiter = async (recruiterId, keywordPattern, limit) => {
  const query = `
    SELECT ap.id, j.title AS job_title, u.fullname AS candidate_name, ap.status
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    JOIN users u ON u.id = ap.user_id
    WHERE j.recruiter_id = $1 AND ap.status != 'Withdrawn'
      AND (u.fullname ILIKE $2 OR j.title ILIKE $2 OR ap.status ILIKE $2)
    ORDER BY ap.applied_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [recruiterId, keywordPattern, limit]);
  return result.rows;
};

const searchCandidatesForRecruiter = async (recruiterId, keywordPattern, limit) => {
  const query = `
    SELECT DISTINCT u.id, u.fullname, u.email
    FROM users u
    JOIN applications ap ON ap.user_id = u.id
    JOIN jobs j ON j.id = ap.job_id
    WHERE j.recruiter_id = $1 AND ap.status != 'Withdrawn'
      AND (u.fullname ILIKE $2 OR u.email ILIKE $2)
    ORDER BY u.fullname ASC
    LIMIT $3`;
  const result = await pool.query(query, [recruiterId, keywordPattern, limit]);
  return result.rows;
};

const searchAssessmentsForRecruiter = async (recruiterId, keywordPattern, limit) => {
  const query = `
    SELECT id, title, status
    FROM assessments
    WHERE recruiter_id = $1 AND title ILIKE $2
    ORDER BY created_at DESC
    LIMIT $3`;
  const result = await pool.query(query, [recruiterId, keywordPattern, limit]);
  return result.rows;
};

const searchInterviewsForRecruiter = async (recruiterId, keywordPattern, limit) => {
  const query = `
    SELECT iv.id, j.title AS job_title, u.fullname AS candidate_name, iv.status, iv.scheduled_date
    FROM interviews iv
    JOIN jobs j ON j.id = iv.job_id
    JOIN users u ON u.id = iv.candidate_id
    WHERE iv.recruiter_id = $1
      AND (u.fullname ILIKE $2 OR j.title ILIKE $2 OR iv.status ILIKE $2)
    ORDER BY iv.scheduled_date DESC
    LIMIT $3`;
  const result = await pool.query(query, [recruiterId, keywordPattern, limit]);
  return result.rows;
};

const searchTechnicalInterviewsForRecruiter = async (recruiterId, keywordPattern, limit) => {
  const query = `
    SELECT ti.id, j.title AS job_title, u.fullname AS candidate_name, ti.status, ti.scheduled_date
    FROM technical_interviews ti
    JOIN jobs j ON j.id = ti.job_id
    JOIN users u ON u.id = ti.candidate_id
    WHERE ti.recruiter_id = $1
      AND (u.fullname ILIKE $2 OR j.title ILIKE $2 OR ti.status ILIKE $2)
    ORDER BY ti.scheduled_date DESC
    LIMIT $3`;
  const result = await pool.query(query, [recruiterId, keywordPattern, limit]);
  return result.rows;
};

const searchAiInterviewsAdmin = async (keywordPattern, limit) => {
  const query = `
    SELECT ai.id, j.title AS job_title, u.fullname AS candidate_name, ai.status
    FROM ai_interviews ai
    JOIN jobs j ON j.id = ai.job_id
    JOIN users u ON u.id = ai.candidate_id
    WHERE u.fullname ILIKE $1 OR j.title ILIKE $1 OR ai.status ILIKE $1
    ORDER BY ai.created_at DESC
    LIMIT $2`;
  const result = await pool.query(query, [keywordPattern, limit]);
  return result.rows;
};

const searchTechnicalInterviewsAdmin = async (keywordPattern, limit) => {
  const query = `
    SELECT ti.id, j.title AS job_title, u.fullname AS candidate_name, ti.status
    FROM technical_interviews ti
    JOIN jobs j ON j.id = ti.job_id
    JOIN users u ON u.id = ti.candidate_id
    WHERE u.fullname ILIKE $1 OR j.title ILIKE $1 OR ti.status ILIKE $1
    ORDER BY ti.created_at DESC
    LIMIT $2`;
  const result = await pool.query(query, [keywordPattern, limit]);
  return result.rows;
};

module.exports = {
  searchAvailableJobsForCandidate,
  searchAppliedJobsForCandidate,
  searchSavedJobsForCandidate,
  searchAssessmentsForCandidate,
  searchProfileForCandidate,
  searchNotificationsForUser,
  searchPostedJobsForRecruiter,
  searchApplicationsForRecruiter,
  searchCandidatesForRecruiter,
  searchAssessmentsForRecruiter,
  searchInterviewsForRecruiter,
  searchTechnicalInterviewsForRecruiter,
  searchAiInterviewsAdmin,
  searchTechnicalInterviewsAdmin
};
