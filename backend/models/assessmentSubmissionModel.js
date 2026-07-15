const pool = require("../config/db");
const { markAssignmentStatus } = require("./assessmentAssignmentModel");
const startAssessment = async (assignmentId, candidateId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const assignmentResult = await client.query(
      `SELECT aa.*, a.status AS assessment_status, a.total_marks,
         (aa.scheduled_start AT TIME ZONE 'UTC') AS scheduled_start,
         (aa.scheduled_end AT TIME ZONE 'UTC') AS scheduled_end
       FROM assessment_assignments aa JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.id = $1 AND aa.candidate_id = $2 FOR UPDATE`,
      [assignmentId, candidateId]
    );
    const assignment = assignmentResult.rows[0];
    if (!assignment) {
      await client.query("ROLLBACK");
      return { error: "not_found" };
    }
    if (assignment.assessment_status !== "Published") {
      await client.query("ROLLBACK");
      return { error: "not_published" };
    }
    if (assignment.scheduled_start && new Date(assignment.scheduled_start) > new Date()) {
      await client.query("ROLLBACK");
      return { error: "not_started_yet" };
    }
    if (assignment.scheduled_end && new Date(assignment.scheduled_end) < new Date()) {
      await client.query("ROLLBACK");
      return { error: "expired" };
    }
    if (assignment.status === "Completed") {
      await client.query("ROLLBACK");
      return { error: "already_completed" };
    }
    const existing = await client.query(
      `SELECT *,
         (started_at AT TIME ZONE 'UTC') AS started_at,
         (submitted_at AT TIME ZONE 'UTC') AS submitted_at
       FROM assessment_submissions WHERE assignment_id = $1`,
      [assignmentId]
    );
    let submission = existing.rows[0];
    if (!submission) {
      const insertResult = await client.query(
        `INSERT INTO assessment_submissions
           (assignment_id, assessment_id, candidate_id, started_at, max_score, status)
         VALUES ($1, $2, $3, NOW(), $4, 'In Progress')
         RETURNING *, (started_at AT TIME ZONE 'UTC') AS started_at `,
        [assignmentId, assignment.assessment_id, candidateId, assignment.total_marks]
      );
      submission = insertResult.rows[0];
    }
    await markAssignmentStatus(assignmentId, "Started", client);
    await client.query("COMMIT");
    return { submission };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const getSubmissionForCandidate = async (submissionId, candidateId) => {
  const result = await pool.query(
    `SELECT *,
       (started_at AT TIME ZONE 'UTC') AS started_at,
       (submitted_at AT TIME ZONE 'UTC') AS submitted_at
     FROM assessment_submissions WHERE id = $1 AND candidate_id = $2`,
    [submissionId, candidateId]
  );
  return result.rows[0];
};
const getQuestionsForSubmission = async (assessmentId) => {
  const result = await pool.query(
    `SELECT id, question_text, question_type, options, marks, order_index
     FROM assessment_questions WHERE assessment_id = $1 ORDER BY order_index ASC, id ASC`,
    [assessmentId]
  );
  return result.rows;
};
const saveAnswers = async (submissionId, candidateId, answers) => {
  const submission = await getSubmissionForCandidate(submissionId, candidateId);
  if (!submission) {
    return null;
  }
  if (submission.status !== "In Progress") {
    return { locked: true };
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const ans of answers) {
      await client.query(
        `INSERT INTO assessment_answers (submission_id, question_id, answer_text, answered_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (submission_id, question_id) DO UPDATE SET
           answer_text = EXCLUDED.answer_text, answered_at = NOW(), updated_at = NOW()`,
        [submissionId, ans.questionId, ans.answerText !== undefined ? ans.answerText : null]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  const result = await pool.query(`SELECT * FROM assessment_answers WHERE submission_id = $1`, [submissionId]);
  return { locked: false, answers: result.rows };
};
const scoreAndFinalizeSubmission = async (submissionId, candidateId, { answers, autoSubmit = false }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const subResult = await client.query(
      `SELECT s.*, a.passing_marks,
         (s.started_at AT TIME ZONE 'UTC') AS started_at
       FROM assessment_submissions s
       JOIN assessments a ON a.id = s.assessment_id
       WHERE s.id = $1 AND s.candidate_id = $2 FOR UPDATE`,
      [submissionId, candidateId]
    );
    const submission = subResult.rows[0];
    if (!submission) {
      await client.query("ROLLBACK");
      return { error: "not_found" };
    }
    if (submission.status !== "In Progress") {
      await client.query("ROLLBACK");
      return { error: "already_submitted", submission };
    }
    if (Array.isArray(answers) && answers.length > 0) {
      for (const ans of answers) {
        await client.query(
          `INSERT INTO assessment_answers (submission_id, question_id, answer_text, answered_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (submission_id, question_id) DO UPDATE SET
             answer_text = EXCLUDED.answer_text, answered_at = NOW(), updated_at = NOW()`,
          [submissionId, ans.questionId, ans.answerText !== undefined ? ans.answerText : null]
        );
      }
    }
    const questionsResult = await client.query(
      `SELECT id, question_type, correct_answer, marks FROM assessment_questions WHERE assessment_id = $1`,
      [submission.assessment_id]
    );
    const answersResult = await client.query(
      `SELECT * FROM assessment_answers WHERE submission_id = $1`,
      [submissionId]
    );
    const answerByQuestion = new Map(answersResult.rows.map((a) => [a.question_id, a]));
    let totalScore = 0;
    let maxScore = 0;
    for (const q of questionsResult.rows) {
      maxScore += q.marks;
      const givenAnswer = answerByQuestion.get(q.id);
      let isCorrect = null;
      let marksObtained = 0;
      if (givenAnswer && givenAnswer.answer_text !== null && givenAnswer.answer_text !== "") {
        if (q.question_type === "mcq" || q.question_type === "true_false") {
          isCorrect =
            q.correct_answer !== null &&
            givenAnswer.answer_text.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
          marksObtained = isCorrect ? q.marks : 0;
        } else {
          if (q.correct_answer) {
            isCorrect = givenAnswer.answer_text.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
            marksObtained = isCorrect ? q.marks : 0;
          }
        }
        await client.query(
          `UPDATE assessment_answers SET is_correct = $1, marks_obtained = $2, updated_at = NOW()
           WHERE submission_id = $3 AND question_id = $4`,
          [isCorrect, marksObtained, submissionId, q.id]
        );
      }
      totalScore += marksObtained;
    }
    const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;
    const result = totalScore >= submission.passing_marks ? "Pass" : "Fail";
    const status = autoSubmit ? "Auto Submitted" : "Submitted";
    const startedAt = submission.started_at ? new Date(submission.started_at) : new Date();
    const timeTakenSeconds = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000));
    const updateResult = await client.query(
      `UPDATE assessment_submissions SET
         submitted_at = NOW(), time_taken_seconds = $1, total_score = $2, max_score = $3,
         percentage = $4, result = $5, status = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *,
         (started_at AT TIME ZONE 'UTC') AS started_at,
         (submitted_at AT TIME ZONE 'UTC') AS submitted_at `,
      [timeTakenSeconds, totalScore, maxScore, percentage, result, status, submissionId]
    );
    await markAssignmentStatus(submission.assignment_id, "Completed", client);
    await client.query("COMMIT");
    return { submission: updateResult.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const getResultsForAssessment = async (assessmentId, recruiterId) => {
  const ownerCheck = await pool.query(
    `SELECT id FROM assessments WHERE id = $1 AND recruiter_id = $2`,
    [assessmentId, recruiterId]
  );
  if (!ownerCheck.rows[0]) {
    return null;
  }
  const query = `
    SELECT s.*, u.fullname AS candidate_name, u.email AS candidate_email,
      RANK() OVER (ORDER BY s.total_score DESC, s.time_taken_seconds ASC NULLS LAST) AS rank
    FROM assessment_submissions s
    JOIN users u ON u.id = s.candidate_id
    WHERE s.assessment_id = $1 AND s.status IN ('Submitted', 'Auto Submitted')
    ORDER BY s.total_score DESC, s.time_taken_seconds ASC NULLS LAST `;
  const result = await pool.query(query, [assessmentId]);
  return result.rows;
};
const getSubmissionDetailForRecruiter = async (submissionId, recruiterId) => {
  const query = `
    SELECT s.*, u.fullname AS candidate_name, u.email AS candidate_email, u.phone AS candidate_phone,
      a.title AS assessment_title, a.recruiter_id,
      (s.started_at AT TIME ZONE 'UTC') AS started_at,
      (s.submitted_at AT TIME ZONE 'UTC') AS submitted_at
    FROM assessment_submissions s
    JOIN users u ON u.id = s.candidate_id
    JOIN assessments a ON a.id = s.assessment_id
    WHERE s.id = $1 AND a.recruiter_id = $2 `;
  const result = await pool.query(query, [submissionId, recruiterId]);
  const submission = result.rows[0];
  if (!submission) {
    return null;
  }
  const answersResult = await pool.query(
    `SELECT ans.*, q.question_text, q.question_type, q.options, q.correct_answer, q.marks AS question_marks
     FROM assessment_answers ans
     JOIN assessment_questions q ON q.id = ans.question_id
     WHERE ans.submission_id = $1
     ORDER BY q.order_index ASC, q.id ASC`,
    [submissionId]
  );
  submission.answers = answersResult.rows;
  return submission;
};
const getSubmissionDetailForCandidate = async (submissionId, candidateId) => {
  const submission = await getSubmissionForCandidate(submissionId, candidateId);
  if (!submission) {
    return null;
  }
  const answersResult = await pool.query(
    `SELECT ans.*, q.question_text, q.question_type, q.options, q.marks AS question_marks
     FROM assessment_answers ans
     JOIN assessment_questions q ON q.id = ans.question_id
     WHERE ans.submission_id = $1
     ORDER BY q.order_index ASC, q.id ASC`,
    [submissionId]
  );
  submission.answers = answersResult.rows;
  return submission;
};
module.exports = {
  startAssessment,
  getSubmissionForCandidate,
  getQuestionsForSubmission,
  saveAnswers,
  scoreAndFinalizeSubmission,
  getResultsForAssessment,
  getSubmissionDetailForRecruiter,
  getSubmissionDetailForCandidate
};