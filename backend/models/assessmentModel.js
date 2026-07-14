const pool = require("../config/db");
const ASSESSMENT_SELECT = `
  SELECT a.*, j.title AS job_title,
    (SELECT COUNT(*)::int FROM assessment_questions q WHERE q.assessment_id = a.id) AS question_count,
    (SELECT COUNT(*)::int FROM assessment_assignments aa WHERE aa.assessment_id = a.id) AS assigned_count
  FROM assessments a LEFT JOIN jobs j ON j.id = a.job_id `;
const insertQuestions = async (client, assessmentId, questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }
  const rows = [];
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    const query = `
      INSERT INTO assessment_questions
        (assessment_id, question_text, question_type, options, correct_answer, marks, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING * `;
    const values = [
      assessmentId,
      q.questionText,
      q.questionType || "mcq",
      q.options ? JSON.stringify(q.options) : null,
      q.correctAnswer || null,
      q.marks || 1,
      q.orderIndex !== undefined ? q.orderIndex : i
    ];
    const result = await client.query(query, values);
    rows.push(result.rows[0]);
  }
  return rows;
};
const recalculateTotalMarks = async (client, assessmentId) => {
  const query = `
    UPDATE assessments SET total_marks = COALESCE(
      (SELECT SUM(marks) FROM assessment_questions WHERE assessment_id = $1), 0
    ), updated_at = NOW()
    WHERE id = $1
    RETURNING total_marks `;
  const result = await client.query(query, [assessmentId]);
  return result.rows[0] ? result.rows[0].total_marks : 0;
};
const createAssessment = async (recruiterId, data) => {
  const { title, description, instructions, jobId, durationMinutes, passingMarks, questions } = data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const query = `
      INSERT INTO assessments
        (recruiter_id, job_id, title, description, instructions, duration_minutes, passing_marks, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draft')
      RETURNING * `;
    const values = [
      recruiterId,
      jobId || null,
      title,
      description || null,
      instructions || null,
      durationMinutes || 30,
      passingMarks || 0
    ];
    const result = await client.query(query, values);
    const assessment = result.rows[0];
    await insertQuestions(client, assessment.id, questions);
    await recalculateTotalMarks(client, assessment.id);
    await client.query("COMMIT");
    return getAssessmentById(assessment.id, recruiterId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const updateAssessment = async (assessmentId, recruiterId, data) => {
  const { title, description, instructions, jobId, durationMinutes, passingMarks, questions } = data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ownerCheck = await client.query(
      `SELECT id, status FROM assessments WHERE id = $1 AND recruiter_id = $2`,
      [assessmentId, recruiterId]
    );
    if (!ownerCheck.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }
    const query = `
      UPDATE assessments SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        instructions = COALESCE($3, instructions),
        job_id = COALESCE($4, job_id),
        duration_minutes = COALESCE($5, duration_minutes),
        passing_marks = COALESCE($6, passing_marks),
        updated_at = NOW()
      WHERE id = $7 AND recruiter_id = $8
      RETURNING * `;
    const values = [
      title || null,
      description !== undefined ? description : null,
      instructions !== undefined ? instructions : null,
      jobId || null,
      durationMinutes || null,
      passingMarks !== undefined && passingMarks !== null ? passingMarks : null,
      assessmentId,
      recruiterId
    ];
    await client.query(query, values);
    if (Array.isArray(questions)) {
      await client.query(`DELETE FROM assessment_questions WHERE assessment_id = $1`, [assessmentId]);
      await insertQuestions(client, assessmentId, questions);
    }
    await recalculateTotalMarks(client, assessmentId);
    await client.query("COMMIT");
    return getAssessmentById(assessmentId, recruiterId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const deleteAssessment = async (assessmentId, recruiterId) => {
  const query = `DELETE FROM assessments WHERE id = $1 AND recruiter_id = $2 RETURNING id`;
  const result = await pool.query(query, [assessmentId, recruiterId]);
  return result.rows[0];
};

const getAssessmentById = async (assessmentId, recruiterId) => {
  const query = `${ASSESSMENT_SELECT} WHERE a.id = $1 AND a.recruiter_id = $2`;
  const result = await pool.query(query, [assessmentId, recruiterId]);
  const assessment = result.rows[0];
  if (!assessment) {
    return null;
  }
  const questionsResult = await pool.query(
    `SELECT * FROM assessment_questions WHERE assessment_id = $1 ORDER BY order_index ASC, id ASC`,
    [assessmentId]
  );
  assessment.questions = questionsResult.rows;
  return assessment;
};

const getAssessmentsByRecruiter = async (recruiterId, filters = {}) => {
  const { status, jobId } = filters;
  const conditions = [`a.recruiter_id = $1`];
  const values = [recruiterId];
  let idx = 2;
  if (status) {
    conditions.push(`a.status = $${idx}`);
    values.push(status);
    idx += 1;
  }
  if (jobId) {
    conditions.push(`a.job_id = $${idx}`);
    values.push(jobId);
    idx += 1;
  }
  const query = `
    ${ASSESSMENT_SELECT}
    WHERE ${conditions.join(" AND ")}
    ORDER BY a.created_at DESC `;
  const result = await pool.query(query, values);
  return result.rows;
};

const setAssessmentStatus = async (assessmentId, recruiterId, status) => {
  const query = `
    UPDATE assessments SET status = $1, updated_at = NOW()
    WHERE id = $2 AND recruiter_id = $3
    RETURNING * `;
  const result = await pool.query(query, [status, assessmentId, recruiterId]);
  return result.rows[0];
};

const getQuestionCount = async (assessmentId) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM assessment_questions WHERE assessment_id = $1`,
    [assessmentId]
  );
  return result.rows[0].count;
};

const findAssessmentRaw = async (assessmentId) => {
  const result = await pool.query(`SELECT * FROM assessments WHERE id = $1`, [assessmentId]);
  return result.rows[0];
};
module.exports = {
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentById,
  getAssessmentsByRecruiter,
  setAssessmentStatus,
  getQuestionCount,
  findAssessmentRaw
};
