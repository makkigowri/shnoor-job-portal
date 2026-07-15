const pool = require("../config/db");
const APPLICATION_WITH_JOB_SELECT = `
  SELECT
    ap.*,j.title AS job_title,j.location AS job_location,j.employment_type,j.experience AS job_experience,j.salary AS job_salary,j.status AS job_status,j.recruiter_id,u.fullname AS recruiter_name,u.email AS recruiter_email,
    c.company_name,c.logo_path AS company_logo FROM applications ap JOIN jobs j ON j.id = ap.job_id JOIN users u ON u.id = j.recruiter_id
  LEFT JOIN companies c ON c.recruiter_id = j.recruiter_id `;
const getApplicationByUserAndJob = async (userId, jobId) => {
  const query = `SELECT * FROM applications WHERE user_id = $1 AND job_id = $2`;
  const result = await pool.query(query, [userId, jobId]);
  return result.rows[0];
};
const applyToJob = async (userId, jobId, resumePath, resumeFilename) => {
  const query = `
    INSERT INTO applications (user_id, job_id, resume_path, resume_filename, status, applied_at, updated_at)
    VALUES ($1, $2, $3, $4, 'Applied', NOW(), NOW()) ON CONFLICT (user_id, job_id) DO UPDATE SET
      status = 'Applied', resume_path = EXCLUDED.resume_path, resume_filename = EXCLUDED.resume_filename, recruiter_note = NULL,applied_at = NOW(), updated_at = NOW()
    WHERE applications.status = 'Withdrawn' RETURNING * `;
  const result = await pool.query(query, [userId, jobId, resumePath, resumeFilename]);
  return result.rows[0];
};
const withdrawApplication = async (userId, jobId) => {
  const query = `
    UPDATE applications SET status = 'Withdrawn', updated_at = NOW() WHERE user_id = $1 AND job_id = $2 AND status != 'Withdrawn' RETURNING * `;
  const result = await pool.query(query, [userId, jobId]);
  return result.rows[0];
};
const getApplicationsByUser = async (userId) => {
  const query = `
    ${APPLICATION_WITH_JOB_SELECT}WHERE ap.user_id = $1 ORDER BY ap.applied_at DESC `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};
const getApplicationsByJob = async (jobId) => {
  const query = `
    SELECT ap.* FROM applications ap WHERE ap.job_id = $1 ORDER BY ap.applied_at DESC
  `;
  const result = await pool.query(query, [jobId]);
  return result.rows;
};
const CANDIDATE_APPLICATION_SELECT = `
  SELECT ap.id, ap.user_id, ap.job_id, ap.status,ap.recruiter_note, ap.resume_path,ap.resume_filename,ap.applied_at,ap.updated_at,
    ap.ats_score,ap.ats_matched_skills,ap.ats_missing_skills,ap.ats_evaluated_at,j.title AS job_title,j.location AS job_location,
    j.employment_type,u.fullname AS candidate_name,u.email AS candidate_email,u.phone AS candidate_phone,jp.location AS candidate_location,jp.qualification AS candidate_qualification,
    jp.specialization AS candidate_specialization,jp.skills AS candidate_skills,iv.id AS interview_id,iv.scheduled_date AS interview_date,iv.scheduled_time AS interview_time,iv.status AS interview_status
  FROM applications ap JOIN jobs j ON j.id = ap.job_id JOIN users u ON u.id = ap.user_id LEFT JOIN job_seeker_profiles jp ON jp.user_id = ap.user_id LEFT JOIN interviews iv ON iv.application_id = ap.id `;
const getApplicantsForRecruiter = async (recruiterId, filters = {}) => {
  const { jobId, status } = filters;
  const conditions = [`j.recruiter_id = $1`, `ap.status != 'Withdrawn'`];
  const values = [recruiterId];
  let idx = 2;
  if (jobId) {
    conditions.push(`ap.job_id = $${idx}`);
    values.push(jobId);
    idx += 1;
  }
  if (status) {
    conditions.push(`ap.status = $${idx}`);
    values.push(status);
    idx += 1;
  }
  const query = `
    ${CANDIDATE_APPLICATION_SELECT}
    WHERE ${conditions.join(" AND ")}
    ORDER BY ap.applied_at DESC `;
  const result = await pool.query(query, values);
  return result.rows;
};
const getApplicationForRecruiter = async (applicationId, recruiterId) => {
  const query = `
    ${CANDIDATE_APPLICATION_SELECT}
    WHERE ap.id = $1 AND j.recruiter_id = $2`;
  const result = await pool.query(query, [applicationId, recruiterId]);
  return result.rows[0];
};
const updateApplicationStatus = async (applicationId, recruiterId, status, recruiterNote) => {
  const query = `
    UPDATE applications ap
    SET status = $1,
        recruiter_note = COALESCE($2, ap.recruiter_note),
        updated_at = NOW()
    FROM jobs j
    WHERE ap.id = $3 AND ap.job_id = j.id AND j.recruiter_id = $4
    RETURNING ap.* `;
  const result = await pool.query(query, [status, recruiterNote || null, applicationId, recruiterId]);
  return result.rows[0];
};
const applyAtsResult = async (applicationId, { status, atsScore, matchedSkills, missingSkills }) => {
  const query = `
    UPDATE applications
    SET status = $1,
        ats_score = $2,
        ats_matched_skills = $3,
        ats_missing_skills = $4,
        ats_evaluated_at = NOW(),
        updated_at = NOW()
    WHERE id = $5
    RETURNING * `;
  const values = [
    status,
    atsScore,
    (matchedSkills || []).join(", ") || null,
    (missingSkills || []).join(", ") || null,
    applicationId
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const getProcessableApplicationsForUser = async (userId) => {
  const query = `
    SELECT ap.id, ap.user_id, ap.job_id, ap.status,
      j.title AS job_title, j.skills AS job_skills, j.recruiter_id, j.status AS job_status
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    WHERE ap.user_id = $1
      AND ap.status IN ('Applied', 'Under Review')
      AND j.status = 'Active'
    ORDER BY ap.applied_at ASC `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};
const countApplicationsForRecruiter = async (recruiterId) => {
  const query = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE ap.status = 'Shortlisted')::int AS shortlisted,
      COUNT(*) FILTER (WHERE ap.status = 'Applied' OR ap.status = 'Under Review')::int AS pending
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    WHERE j.recruiter_id = $1 AND ap.status != 'Withdrawn' `;
  const result = await pool.query(query, [recruiterId]);
  return result.rows[0];
};
const getRecentApplicationsForRecruiter = async (recruiterId, limit = 5) => {
  const query = `
    ${CANDIDATE_APPLICATION_SELECT}
    WHERE j.recruiter_id = $1 AND ap.status != 'Withdrawn'
    ORDER BY ap.applied_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [recruiterId, limit]);
  return result.rows;
};
module.exports = {
  getApplicationByUserAndJob,applyToJob,withdrawApplication,getApplicationsByUser,getApplicationsByJob,getApplicantsForRecruiter,getApplicationForRecruiter,updateApplicationStatus,countApplicationsForRecruiter,getRecentApplicationsForRecruiter,applyAtsResult,getProcessableApplicationsForUser
};