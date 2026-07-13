const pool = require("../config/db");

/* ---------------------------- Dashboard ---------------------------- */

const getDashboardStats = async () => {
  const query = `
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE role = 'jobseeker') AS total_users,
      (SELECT COUNT(*)::int FROM users WHERE role = 'recruiter') AS total_recruiters,
      (SELECT COUNT(*)::int FROM jobs) AS total_jobs,
      (SELECT COUNT(*)::int FROM jobs WHERE status = 'Active') AS active_jobs,
      (SELECT COUNT(*)::int FROM applications WHERE status != 'Withdrawn') AS applications_received,
      (SELECT COUNT(*)::int FROM applications WHERE status = 'Shortlisted') AS shortlisted,
      (SELECT COUNT(*)::int FROM applications WHERE status = 'Rejected') AS rejected,
      (SELECT COUNT(*)::int FROM interviews WHERE status = 'Scheduled') AS interviews_scheduled,
      (SELECT COUNT(*)::int FROM applications WHERE status IN ('Applied', 'Under Review')) AS pending_reviews
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

const getLatestUsers = async (limit = 5) => {
  const query = `
    SELECT id, fullname, email, phone, is_blocked, created_at
    FROM users WHERE role = 'jobseeker'
    ORDER BY created_at DESC LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getLatestRecruiters = async (limit = 5) => {
  const query = `
    SELECT u.id, u.fullname, u.email, u.phone, u.is_blocked, u.created_at, c.company_name
    FROM users u LEFT JOIN companies c ON c.recruiter_id = u.id
    WHERE u.role = 'recruiter'
    ORDER BY u.created_at DESC LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getRecentJobPosts = async (limit = 5) => {
  const query = `
    SELECT j.id, j.title, j.location, j.status, j.created_at, u.fullname AS recruiter_name, c.company_name,
      (SELECT COUNT(*)::int FROM applications a WHERE a.job_id = j.id) AS applications_count
    FROM jobs j JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id
    ORDER BY j.created_at DESC LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getRecentApplicationsAdmin = async (limit = 5) => {
  const query = `
    SELECT ap.id, ap.status, ap.applied_at, ap.ats_score, cand.fullname AS candidate_name,
      j.title AS job_title, rec.fullname AS recruiter_name
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    JOIN users cand ON cand.id = ap.user_id
    JOIN users rec ON rec.id = j.recruiter_id
    ORDER BY ap.applied_at DESC LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

/* ------------------------------ Users ------------------------------ */

const listUsersAdmin = async ({ search, status, page = 1, limit = 10 }) => {
  const conditions = ["role = 'jobseeker'"];
  const values = [];
  let idx = 1;
  if (search) {
    conditions.push(`(fullname ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx += 1;
  }
  if (status === "blocked") {
    conditions.push("is_blocked = TRUE");
  } else if (status === "active") {
    conditions.push("is_blocked = FALSE");
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, values);
  const total = countResult.rows[0].total;
  const offset = (Math.max(page, 1) - 1) * limit;
  const dataQuery = `
    SELECT id, fullname, email, phone, role, is_blocked, created_at
    FROM users ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}`;
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
  return { users: dataResult.rows, total, page: Number(page), limit: Number(limit), totalPages: Math.max(Math.ceil(total / limit), 1) };
};

const getUserByIdAdmin = async (id) => {
  const query = `
    SELECT u.id, u.fullname, u.email, u.phone, u.role, u.is_blocked, u.created_at,
      jp.location, jp.qualification, jp.specialization, jp.skills, jp.about, jp.resume_path,
      (SELECT COUNT(*)::int FROM applications a WHERE a.user_id = u.id AND a.status != 'Withdrawn') AS applications_count
    FROM users u LEFT JOIN job_seeker_profiles jp ON jp.user_id = u.id
    WHERE u.id = $1 AND u.role = 'jobseeker'`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* --------------------------- Recruiters ----------------------------- */

const listRecruitersAdmin = async ({ search, status, page = 1, limit = 10 }) => {
  const conditions = ["u.role = 'recruiter'"];
  const values = [];
  let idx = 1;
  if (search) {
    conditions.push(`(u.fullname ILIKE $${idx} OR u.email ILIKE $${idx} OR c.company_name ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx += 1;
  }
  if (status === "blocked") {
    conditions.push("u.is_blocked = TRUE");
  } else if (status === "active") {
    conditions.push("u.is_blocked = FALSE");
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM users u LEFT JOIN companies c ON c.recruiter_id = u.id ${whereClause}`,
    values
  );
  const total = countResult.rows[0].total;
  const offset = (Math.max(page, 1) - 1) * limit;
  const dataQuery = `
    SELECT u.id, u.fullname, u.email, u.phone, u.is_blocked, u.created_at, c.company_name,
      (SELECT COUNT(*)::int FROM jobs j WHERE j.recruiter_id = u.id) AS jobs_posted,
      (SELECT COUNT(*)::int FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = u.id AND a.status != 'Withdrawn') AS applications_count
    FROM users u LEFT JOIN companies c ON c.recruiter_id = u.id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}`;
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
  return { recruiters: dataResult.rows, total, page: Number(page), limit: Number(limit), totalPages: Math.max(Math.ceil(total / limit), 1) };
};

const getRecruiterByIdAdmin = async (id) => {
  const query = `
    SELECT u.id, u.fullname, u.email, u.phone, u.is_blocked, u.created_at,
      c.company_name, c.website, c.industry, c.company_size, c.headquarters, c.description, c.logo_path,
      (SELECT COUNT(*)::int FROM jobs j WHERE j.recruiter_id = u.id) AS jobs_posted,
      (SELECT COUNT(*)::int FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = u.id AND a.status != 'Withdrawn') AS applications_count
    FROM users u LEFT JOIN companies c ON c.recruiter_id = u.id
    WHERE u.id = $1 AND u.role = 'recruiter'`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* -------------------------- Shared user actions ---------------------- */

const setUserBlockedStatus = async (id, isBlocked) => {
  const query = `UPDATE users SET is_blocked = $1 WHERE id = $2 RETURNING id, fullname, email, role, is_blocked`;
  const result = await pool.query(query, [isBlocked, id]);
  return result.rows[0];
};

const deleteUserAdminById = async (id) => {
  const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* -------------------------------- Jobs -------------------------------- */

const listJobsAdmin = async ({ search, status, page = 1, limit = 10 }) => {
  const conditions = [];
  const values = [];
  let idx = 1;
  if (search) {
    conditions.push(`(j.title ILIKE $${idx} OR j.location ILIKE $${idx} OR u.fullname ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx += 1;
  }
  if (status) {
    conditions.push(`j.status = $${idx}`);
    values.push(status);
    idx += 1;
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM jobs j JOIN users u ON u.id = j.recruiter_id ${whereClause}`,
    values
  );
  const total = countResult.rows[0].total;
  const offset = (Math.max(page, 1) - 1) * limit;
  const dataQuery = `
    SELECT j.id, j.title, j.location, j.status, j.created_at, u.fullname AS recruiter_name, u.id AS recruiter_id, c.company_name,
      (SELECT COUNT(*)::int FROM applications a WHERE a.job_id = j.id AND a.status != 'Withdrawn') AS applications_count
    FROM jobs j JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id
    ${whereClause}
    ORDER BY j.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}`;
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
  return { jobs: dataResult.rows, total, page: Number(page), limit: Number(limit), totalPages: Math.max(Math.ceil(total / limit), 1) };
};

const getJobByIdAdmin = async (id) => {
  const query = `
    SELECT j.*, u.fullname AS recruiter_name, u.email AS recruiter_email, c.company_name,
      (SELECT COUNT(*)::int FROM applications a WHERE a.job_id = j.id AND a.status != 'Withdrawn') AS applications_count
    FROM jobs j JOIN users u ON u.id = j.recruiter_id LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id
    WHERE j.id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const setJobStatusAdmin = async (id, status) => {
  const query = `UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

const deleteJobAdminById = async (id) => {
  const query = `DELETE FROM jobs WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* --------------------------- Applications ------------------------------ */

const listApplicationsAdmin = async ({ search, status, page = 1, limit = 10 }) => {
  const conditions = ["ap.status != 'Withdrawn'"];
  const values = [];
  let idx = 1;
  if (search) {
    conditions.push(`(cand.fullname ILIKE $${idx} OR j.title ILIKE $${idx} OR rec.fullname ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx += 1;
  }
  if (status) {
    conditions.push(`ap.status = $${idx}`);
    values.push(status);
    idx += 1;
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const baseFrom = `
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    JOIN users cand ON cand.id = ap.user_id
    JOIN users rec ON rec.id = j.recruiter_id`;
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseFrom} ${whereClause}`, values);
  const total = countResult.rows[0].total;
  const offset = (Math.max(page, 1) - 1) * limit;
  const dataQuery = `
    SELECT ap.id, ap.status, ap.applied_at, ap.resume_path, ap.resume_filename, ap.ats_score,
      cand.id AS candidate_id, cand.fullname AS candidate_name, cand.email AS candidate_email,
      j.id AS job_id, j.title AS job_title,
      rec.id AS recruiter_id, rec.fullname AS recruiter_name
    ${baseFrom}
    ${whereClause}
    ORDER BY ap.applied_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}`;
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
  return { applications: dataResult.rows, total, page: Number(page), limit: Number(limit), totalPages: Math.max(Math.ceil(total / limit), 1) };
};

const getApplicationByIdAdmin = async (id) => {
  const query = `
    SELECT ap.*, cand.fullname AS candidate_name, cand.email AS candidate_email, cand.phone AS candidate_phone,
      j.title AS job_title, j.location AS job_location, rec.fullname AS recruiter_name, rec.email AS recruiter_email
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    JOIN users cand ON cand.id = ap.user_id
    JOIN users rec ON rec.id = j.recruiter_id
    WHERE ap.id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const deleteApplicationAdminById = async (id) => {
  const query = `DELETE FROM applications WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* ------------------------------ Analytics ------------------------------ */

const getTopRecruiters = async (limit = 10) => {
  const query = `
    SELECT u.id, u.fullname, c.company_name,
      (SELECT COUNT(*)::int FROM jobs j WHERE j.recruiter_id = u.id) AS jobs_posted,
      (SELECT COUNT(*)::int FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = u.id AND a.status != 'Withdrawn') AS applications_count
    FROM users u LEFT JOIN companies c ON c.recruiter_id = u.id
    WHERE u.role = 'recruiter'
    ORDER BY applications_count DESC, jobs_posted DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getTopAppliedJobs = async (limit = 10) => {
  const query = `
    SELECT j.id, j.title, j.location, u.fullname AS recruiter_name, c.company_name,
      COUNT(a.id)::int AS applications_count
    FROM jobs j
    JOIN users u ON u.id = j.recruiter_id
    LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id
    LEFT JOIN applications a ON a.job_id = j.id AND a.status != 'Withdrawn'
    GROUP BY j.id, u.fullname, c.company_name
    ORDER BY applications_count DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getMostActiveUsers = async (limit = 10) => {
  const query = `
    SELECT u.id, u.fullname, u.email,
      COUNT(a.id)::int AS applications_count
    FROM users u
    JOIN applications a ON a.user_id = u.id AND a.status != 'Withdrawn'
    WHERE u.role = 'jobseeker'
    GROUP BY u.id
    ORDER BY applications_count DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getRecentRegistrations = async (limit = 10) => {
  const query = `
    SELECT id, fullname, email, role, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getRecentActivities = async (limit = 15) => {
  const query = `
    (SELECT 'Registration' AS activity_type, fullname AS actor, role AS detail, created_at AS occurred_at FROM users)
    UNION ALL
    (SELECT 'Job Posted' AS activity_type, title AS actor, status AS detail, created_at AS occurred_at FROM jobs)
    UNION ALL
    (SELECT 'Application Submitted' AS activity_type, status AS actor, status AS detail, applied_at AS occurred_at FROM applications WHERE status != 'Withdrawn')
    ORDER BY occurred_at DESC
    LIMIT $1`;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getSystemStatistics = async () => {
  const query = `
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_accounts,
      (SELECT COUNT(*)::int FROM companies) AS total_companies,
      (SELECT COUNT(*)::int FROM jobs WHERE status = 'Closed') AS closed_jobs,
      (SELECT COUNT(*)::int FROM saved_jobs) AS total_saved_jobs,
      (SELECT COUNT(*)::int FROM interviews) AS total_interviews,
      (SELECT COUNT(*)::int FROM interviews WHERE status = 'Completed') AS completed_interviews,
      (SELECT COALESCE(ROUND(AVG(ats_score)), 0)::int FROM applications WHERE ats_score IS NOT NULL) AS avg_ats_score,
      (SELECT COUNT(*)::int FROM users WHERE is_blocked = TRUE) AS blocked_accounts
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  getDashboardStats,
  getLatestUsers,
  getLatestRecruiters,
  getRecentJobPosts,
  getRecentApplicationsAdmin,
  listUsersAdmin,
  getUserByIdAdmin,
  listRecruitersAdmin,
  getRecruiterByIdAdmin,
  setUserBlockedStatus,
  deleteUserAdminById,
  listJobsAdmin,
  getJobByIdAdmin,
  setJobStatusAdmin,
  deleteJobAdminById,
  listApplicationsAdmin,
  getApplicationByIdAdmin,
  deleteApplicationAdminById,
  getTopRecruiters,
  getTopAppliedJobs,
  getMostActiveUsers,
  getRecentRegistrations,
  getRecentActivities,
  getSystemStatistics
};
