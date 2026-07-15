const pool = require("../config/db");
const ASSIGNMENT_WITH_CANDIDATE_SELECT = `
  SELECT aa.*, u.fullname AS candidate_name, u.email AS candidate_email, u.phone AS candidate_phone,
    s.id AS submission_id, s.status AS submission_status, s.total_score, s.max_score, s.percentage, s.result
  FROM assessment_assignments aa
  JOIN users u ON u.id = aa.candidate_id
  LEFT JOIN assessment_submissions s ON s.assignment_id = aa.id `;
const ASSIGNMENT_WITH_ASSESSMENT_SELECT = `
  SELECT aa.*, a.title AS assessment_title, a.description AS assessment_description, a.duration_minutes,
    a.total_marks, a.passing_marks, a.status AS assessment_status, j.title AS job_title,
    co.company_name AS company_name, co.logo_path AS company_logo,
    s.id AS submission_id, s.status AS submission_status,
    (aa.scheduled_start AT TIME ZONE 'UTC') AS scheduled_start,
    (aa.scheduled_end AT TIME ZONE 'UTC') AS scheduled_end
  FROM assessment_assignments aa
  JOIN assessments a ON a.id = aa.assessment_id
  LEFT JOIN jobs j ON j.id = a.job_id
  LEFT JOIN companies co ON co.recruiter_id = aa.recruiter_id
  LEFT JOIN assessment_submissions s ON s.assignment_id = aa.id `;
const getEligibleShortlistedCandidateIds = async (recruiterId, jobId, candidateIds) => {
  const conditions = [`j.recruiter_id = $1`, `ap.status = 'Shortlisted'`, `ap.user_id = ANY($2::int[])`];
  const values = [recruiterId, candidateIds];
  let idx = 3;
  if (jobId) {
    conditions.push(`ap.job_id = $${idx}`);
    values.push(jobId);
    idx += 1;
  }
  const query = `
    SELECT ap.user_id AS candidate_id, ap.id AS application_id
    FROM applications ap
    JOIN jobs j ON j.id = ap.job_id
    WHERE ${conditions.join(" AND ")} `;
  const result = await pool.query(query, values);
  return result.rows;
};
const assignAssessmentToCandidates = async (assessmentId, recruiterId, candidateIds, { scheduledStart, scheduledEnd } = {}) => {
  const assessmentResult = await pool.query(
    `SELECT id, job_id, status FROM assessments WHERE id = $1 AND recruiter_id = $2`,
    [assessmentId, recruiterId]
  );
  const assessment = assessmentResult.rows[0];
  if (!assessment) {
    return { assessment: null, assigned: [], skipped: [] };
  }
  const eligible = await getEligibleShortlistedCandidateIds(recruiterId, assessment.job_id, candidateIds);
  const eligibleMap = new Map(eligible.map((row) => [row.candidate_id, row.application_id]));
  const assigned = [];
  const skipped = [];
  for (const candidateId of candidateIds) {
    if (!eligibleMap.has(Number(candidateId))) {
      skipped.push(candidateId);
      continue;
    }
    const query = `
      INSERT INTO assessment_assignments
        (assessment_id, candidate_id, application_id, recruiter_id, scheduled_start, scheduled_end, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Assigned')
      ON CONFLICT (assessment_id, candidate_id) DO UPDATE SET
        scheduled_start = EXCLUDED.scheduled_start,
        scheduled_end = EXCLUDED.scheduled_end,
        updated_at = NOW()
      RETURNING * `;
    const values = [
      assessmentId,
      candidateId,
      eligibleMap.get(Number(candidateId)),
      recruiterId,
      scheduledStart || null,
      scheduledEnd || null
    ];
    const result = await pool.query(query, values);
    assigned.push(result.rows[0]);
  }
  return { assessment, assigned, skipped };
};
const autoAssignShortlistedCandidates = async (
  assessmentId,
  recruiterId,
  { scheduledStart, scheduledEnd, deadlineDays = 7 } = {}
) => {
  const assessmentResult = await pool.query(
    `SELECT id, job_id, title, status FROM assessments WHERE id = $1 AND recruiter_id = $2`,
    [assessmentId, recruiterId]
  );
  const assessment = assessmentResult.rows[0];
  if (!assessment) {
    return { assessment: null, assigned: [] };
  }
  if (!assessment.job_id) {
    return { assessment, assigned: [] };
  }
  const query = `
    INSERT INTO assessment_assignments
      (assessment_id, candidate_id, application_id, recruiter_id, scheduled_start, scheduled_end, status)
    SELECT
      $1, ap.user_id, ap.id, $2, $5, COALESCE($6, NOW() + ($7 * INTERVAL '1 day')), 'Assigned'
    FROM applications ap
    WHERE ap.job_id = $3
      AND ap.status = ANY($4::text[])
    ON CONFLICT (assessment_id, candidate_id) DO NOTHING
    RETURNING * `;
  const values = [
    assessmentId,
    recruiterId,
    assessment.job_id,
    ["Shortlisted", "Interview Scheduled"],
    scheduledStart || null,
    scheduledEnd || null,
    Number(deadlineDays) > 0 ? Number(deadlineDays) : 7
  ];
  const result = await pool.query(query, values);
  return { assessment, assigned: result.rows };
};
const assignPublishedAssessmentsToNewlyShortlistedCandidate = async (
  jobId,
  candidateId,
  applicationId,
  { deadlineDays = 7 } = {}
) => {
  const query = `
    WITH inserted AS (
      INSERT INTO assessment_assignments
        (assessment_id, candidate_id, application_id, recruiter_id, scheduled_end, status)
      SELECT a.id, $2, $3, a.recruiter_id, NOW() + ($4 * INTERVAL '1 day'), 'Assigned'
      FROM assessments a
      WHERE a.job_id = $1 AND a.status = 'Published'
      ON CONFLICT (assessment_id, candidate_id) DO NOTHING
      RETURNING *
    )
    SELECT inserted.*, a.title AS assessment_title
    FROM inserted
    JOIN assessments a ON a.id = inserted.assessment_id `;
  const values = [jobId, candidateId, applicationId, Number(deadlineDays) > 0 ? Number(deadlineDays) : 7];
  const result = await pool.query(query, values);
  return result.rows;
};
const removeAssignment = async (assignmentId, recruiterId) => {
  const query = `
    DELETE FROM assessment_assignments
    WHERE id = $1 AND recruiter_id = $2 AND status IN ('Assigned', 'Expired')
    RETURNING id `;
  const result = await pool.query(query, [assignmentId, recruiterId]);
  return result.rows[0];
};
const getAssignedCandidates = async (assessmentId, recruiterId) => {
  const query = `
    ${ASSIGNMENT_WITH_CANDIDATE_SELECT}
    WHERE aa.assessment_id = $1 AND aa.recruiter_id = $2
    ORDER BY aa.assigned_at DESC `;
  const result = await pool.query(query, [assessmentId, recruiterId]);
  return result.rows;
};
const getAssignmentForRecruiter = async (assignmentId, recruiterId) => {
  const query = `${ASSIGNMENT_WITH_CANDIDATE_SELECT} WHERE aa.id = $1 AND aa.recruiter_id = $2`;
  const result = await pool.query(query, [assignmentId, recruiterId]);
  return result.rows[0];
};
const getAssignmentForCandidate = async (assignmentId, candidateId) => {
  const query = `${ASSIGNMENT_WITH_ASSESSMENT_SELECT} WHERE aa.id = $1 AND aa.candidate_id = $2`;
  const result = await pool.query(query, [assignmentId, candidateId]);
  return result.rows[0];
};
const getPendingAssessmentsForCandidate = async (candidateId) => {
  const query = `
    ${ASSIGNMENT_WITH_ASSESSMENT_SELECT}
    WHERE aa.candidate_id = $1
      AND a.status = 'Published'
      AND aa.status IN ('Assigned', 'Started')
      AND (aa.scheduled_start IS NULL OR aa.scheduled_start <= NOW())
      AND (aa.scheduled_end IS NULL OR aa.scheduled_end >= NOW())
    ORDER BY aa.scheduled_end ASC NULLS LAST, aa.assigned_at DESC `;
  const result = await pool.query(query, [candidateId]);
  return result.rows;
};
const getUpcomingAssessmentsForCandidate = async (candidateId) => {
  const query = `
    ${ASSIGNMENT_WITH_ASSESSMENT_SELECT}
    WHERE aa.candidate_id = $1
      AND a.status = 'Published'
      AND aa.status = 'Assigned'
      AND aa.scheduled_start IS NOT NULL
      AND aa.scheduled_start > NOW()
    ORDER BY aa.scheduled_start ASC `;
  const result = await pool.query(query, [candidateId]);
  return result.rows;
};
const getCompletedAssessmentsForCandidate = async (candidateId) => {
  const query = `
    SELECT aa.*, a.title AS assessment_title, a.total_marks, a.passing_marks, j.title AS job_title,
      co.company_name AS company_name,
      s.id AS submission_id, s.total_score, s.max_score, s.percentage, s.result, s.status AS submission_status,
      (s.submitted_at AT TIME ZONE 'UTC') AS submitted_at
    FROM assessment_assignments aa
    JOIN assessments a ON a.id = aa.assessment_id
    LEFT JOIN jobs j ON j.id = a.job_id
    LEFT JOIN companies co ON co.recruiter_id = aa.recruiter_id
    JOIN assessment_submissions s ON s.assignment_id = aa.id
    WHERE aa.candidate_id = $1 AND aa.status = 'Completed'
    ORDER BY s.submitted_at DESC `;
  const result = await pool.query(query, [candidateId]);
  return result.rows;
};
const markAssignmentStatus = async (assignmentId, status, client = pool) => {
  const query = `UPDATE assessment_assignments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
  const result = await client.query(query, [status, assignmentId]);
  return result.rows[0];
};
const expireOverdueAssignments = async (candidateId) => {
  const query = `
    UPDATE assessment_assignments SET status = 'Expired', updated_at = NOW()
    WHERE candidate_id = $1 AND status = 'Assigned'
      AND scheduled_end IS NOT NULL AND scheduled_end < NOW()
    RETURNING id `;
  const result = await pool.query(query, [candidateId]);
  return result.rows;
};
module.exports = {
  assignAssessmentToCandidates,
  autoAssignShortlistedCandidates,
  assignPublishedAssessmentsToNewlyShortlistedCandidate,
  removeAssignment,
  getAssignedCandidates,
  getAssignmentForRecruiter,
  getAssignmentForCandidate,
  getPendingAssessmentsForCandidate,
  getUpcomingAssessmentsForCandidate,
  getCompletedAssessmentsForCandidate,
  markAssignmentStatus,
  expireOverdueAssignments
};