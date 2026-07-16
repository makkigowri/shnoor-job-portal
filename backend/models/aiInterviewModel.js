const pool = require("../config/db");
const INTERVIEW_SELECT = `
  SELECT iv.*, j.title AS job_title, j.location AS job_location, j.recruiter_id AS job_recruiter_id,
    u.fullname AS candidate_name, u.email AS candidate_email
  FROM ai_interviews iv
  JOIN jobs j ON j.id = iv.job_id
  JOIN users u ON u.id = iv.candidate_id `;
const activateInterviewForApplication = async ({
  applicationId,
  jobId,
  candidateId,
  recruiterId,
  assessmentSubmissionId,
  jobRole,
  candidateSkills,
  candidateExperience,
  assessmentPercentage,
  totalQuestions = 6
}) => {
  const query = `
    INSERT INTO ai_interviews
      (application_id, job_id, candidate_id, recruiter_id, assessment_submission_id,
       job_role, candidate_skills, candidate_experience, assessment_percentage, total_questions, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Available')
    ON CONFLICT (application_id) DO UPDATE SET
      assessment_submission_id = EXCLUDED.assessment_submission_id,
      assessment_percentage = EXCLUDED.assessment_percentage,
      updated_at = NOW()
    RETURNING * `;
  const values = [
    applicationId,
    jobId,
    candidateId,
    recruiterId,
    assessmentSubmissionId || null,
    jobRole || null,
    candidateSkills || null,
    candidateExperience || null,
    assessmentPercentage != null ? assessmentPercentage : null,
    totalQuestions
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const getInterviewForCandidate = async (interviewId, candidateId) => {
  const result = await pool.query(`${INTERVIEW_SELECT} WHERE iv.id = $1 AND iv.candidate_id = $2`, [
    interviewId,
    candidateId
  ]);
  return result.rows[0];
};
const getInterviewByApplicationForCandidate = async (applicationId, candidateId) => {
  const result = await pool.query(
    `${INTERVIEW_SELECT} WHERE iv.application_id = $1 AND iv.candidate_id = $2`,
    [applicationId, candidateId]
  );
  return result.rows[0];
};
const getInterviewsForCandidate = async (candidateId) => {
  const result = await pool.query(
    `${INTERVIEW_SELECT} WHERE iv.candidate_id = $1 ORDER BY iv.created_at DESC`,
    [candidateId]
  );
  return result.rows;
};
const startInterview = async (interviewId, candidateId) => {
  const result = await pool.query(
    `UPDATE ai_interviews
     SET status = 'In Progress', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
     WHERE id = $1 AND candidate_id = $2 AND status IN ('Available', 'In Progress')
     RETURNING * `,
    [interviewId, candidateId]
  );
  return result.rows[0];
};
const incrementQuestionsAsked = async (interviewId) => {
  const result = await pool.query(
    `UPDATE ai_interviews SET questions_asked = questions_asked + 1, updated_at = NOW()
     WHERE id = $1 RETURNING * `,
    [interviewId]
  );
  return result.rows[0];
};
const addQuestion = async (interviewId, questionOrder, questionText) => {
  const result = await pool.query(
    `INSERT INTO ai_interview_questions (interview_id, question_order, question_text, asked_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (interview_id, question_order) DO UPDATE SET question_text = EXCLUDED.question_text
     RETURNING * `,
    [interviewId, questionOrder, questionText]
  );
  return result.rows[0];
};
const saveAnswer = async (questionId, interviewId, answerText) => {
  const result = await pool.query(
    `UPDATE ai_interview_questions SET candidate_answer = $1, answered_at = NOW()
     WHERE id = $2 AND interview_id = $3
     RETURNING * `,
    [answerText, questionId, interviewId]
  );
  return result.rows[0];
};
const getQuestionsForInterview = async (interviewId) => {
  const result = await pool.query(
    `SELECT * FROM ai_interview_questions WHERE interview_id = $1 ORDER BY question_order ASC`,
    [interviewId]
  );
  return result.rows;
};
const finalizeInterview = async (
  interviewId,
  {
    technicalScore,
    communicationScore,
    confidenceScore,
    problemSolvingScore,
    overallScore,
    result,
    decision,
    feedback,
    strengths,
    weaknesses,
    suggestions
  }
) => {
  const query = `
    UPDATE ai_interviews SET
      status = 'Completed',
      technical_score = $1,
      communication_score = $2,
      confidence_score = $3,
      problem_solving_score = $4,
      overall_score = $5,
      result = $6,
      decision = $7,
      ai_feedback = $8,
      strengths = $9,
      weaknesses = $10,
      suggestions = $11,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = $12
    RETURNING * `;
  const values = [
    technicalScore,
    communicationScore,
    confidenceScore,
    problemSolvingScore,
    overallScore,
    result,
    decision,
    feedback,
    strengths,
    weaknesses,
    suggestions,
    interviewId
  ];
  const dbResult = await pool.query(query, values);
  return dbResult.rows[0];
};
const updateApplicationStatusForInterview = async (applicationId, status) => {
  const result = await pool.query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING * `,
    [status, applicationId]
  );
  return result.rows[0];
};
const markInterviewAvailableStatusOnApplication = async (applicationId) => {
  const result = await pool.query(
    `UPDATE applications SET status = 'AI Interview Available', updated_at = NOW()
     WHERE id = $1 AND status = 'Shortlisted'
     RETURNING * `,
    [applicationId]
  );
  return result.rows[0];
};
const markInterviewInProgressOnApplication = async (applicationId) => {
  const result = await pool.query(
    `UPDATE applications SET status = 'AI Interview In Progress', updated_at = NOW()
     WHERE id = $1
     RETURNING * `,
    [applicationId]
  );
  return result.rows[0];
};
const getInterviewsForRecruiter = async (recruiterId, { status } = {}) => {
  const values = [recruiterId];
  let query = `${INTERVIEW_SELECT} WHERE iv.recruiter_id = $1`;
  if (status) {
    values.push(status);
    query += ` AND iv.status = $${values.length}`;
  }
  query += " ORDER BY iv.updated_at DESC";
  const result = await pool.query(query, values);
  return result.rows;
};
const getAiInterviewAdminStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'Completed') AS completed_interviews,
      COUNT(*) FILTER (WHERE status = 'Completed' AND result = 'Pass') AS passed_interviews,
      COUNT(*) FILTER (WHERE decision = 'Selected') AS job_offers,
      COUNT(*) FILTER (WHERE decision = 'Technical Interview') AS technical_interviews
    FROM ai_interviews
  `);
  const row = result.rows[0];
  const completed = Number(row.completed_interviews) || 0;
  const passed = Number(row.passed_interviews) || 0;
  return {
    completedInterviews: completed,
    passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0,
    jobOffers: Number(row.job_offers) || 0,
    technicalInterviews: Number(row.technical_interviews) || 0
  };
};
const getInterviewDetailForRecruiter = async (interviewId, recruiterId) => {
  const result = await pool.query(`${INTERVIEW_SELECT} WHERE iv.id = $1 AND iv.recruiter_id = $2`, [
    interviewId,
    recruiterId
  ]);
  const interview = result.rows[0];
  if (!interview) return null;
  const questions = await getQuestionsForInterview(interviewId);
  interview.questions = questions;
  return interview;
};
module.exports = {
  activateInterviewForApplication,
  getInterviewForCandidate,
  getInterviewByApplicationForCandidate,
  getInterviewsForCandidate,
  startInterview,
  incrementQuestionsAsked,
  addQuestion,
  saveAnswer,
  getQuestionsForInterview,
  finalizeInterview,
  updateApplicationStatusForInterview,
  markInterviewAvailableStatusOnApplication,
  markInterviewInProgressOnApplication,
  getInterviewDetailForRecruiter,
  getInterviewsForRecruiter,
  getAiInterviewAdminStats
};
