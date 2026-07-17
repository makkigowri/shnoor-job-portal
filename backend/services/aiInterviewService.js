const aiInterviewModel = require("../models/aiInterviewModel");
const { findJobById } = require("../models/jobModel");
const { getProfileByUserId } = require("../models/profileModel");
const { createNotification } = require("../models/notificationModel");
const { sendEmail } = require("./emailService");
const { generateInterviewQuestion, evaluateInterviewAnswer } = require("./ollamaService");
const TOTAL_QUESTIONS = Number(process.env.AI_INTERVIEW_QUESTION_COUNT) > 0
  ? Number(process.env.AI_INTERVIEW_QUESTION_COUNT)
  : 5;
const TECHNICAL_WEIGHT = 0.7;
const COMMUNICATION_WEIGHT = 0.2;
const PRONUNCIATION_WEIGHT = 0.1;
const MARKS_PER_QUESTION = 20;
const computeQuestionScore = (evaluation) => {
  const weighted =
    evaluation.technical * TECHNICAL_WEIGHT +
    evaluation.communication * COMMUNICATION_WEIGHT +
    evaluation.pronunciation * PRONUNCIATION_WEIGHT;
  const scaled = (weighted / 100) * MARKS_PER_QUESTION;
  return Math.max(0, Math.min(MARKS_PER_QUESTION, Math.round(scaled * 100) / 100));
};
const SELECT_THRESHOLD = Number(process.env.AI_INTERVIEW_SELECT_THRESHOLD) || 85;
const TECHNICAL_INTERVIEW_THRESHOLD = Number(process.env.AI_INTERVIEW_TECH_THRESHOLD) || 70;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const activateAfterAssessmentPass = async (submission) => {
  try {
    const pool = require("../config/db");
    const assignmentResult = await pool.query(
      `SELECT aa.application_id, aa.recruiter_id, ap.job_id
       FROM assessment_assignments aa
       LEFT JOIN applications ap ON ap.id = aa.application_id
       WHERE aa.id = $1`,
      [submission.assignment_id]
    );
    const assignment = assignmentResult.rows[0];
    if (!assignment || !assignment.application_id || !assignment.job_id) {
      return null;
    }
    const job = await findJobById(assignment.job_id);
    const profile = await getProfileByUserId(submission.candidate_id).catch(() => null);
    const interview = await aiInterviewModel.activateInterviewForApplication({
      applicationId: assignment.application_id,
      jobId: assignment.job_id,
      candidateId: submission.candidate_id,
      recruiterId: assignment.recruiter_id,
      assessmentSubmissionId: submission.id,
      jobRole: job ? job.title : null,
      candidateSkills: (job && job.skills) || (profile && profile.skills) || null,
      candidateExperience: job ? job.experience : null,
      assessmentPercentage: submission.percentage,
      totalQuestions: TOTAL_QUESTIONS
    });
    await aiInterviewModel.markInterviewAvailableStatusOnApplication(assignment.application_id);
    createNotification(submission.candidate_id, {
      title: "AI Interview Unlocked",
      message: `Great job passing the assessment! Your AI Interview for "${job ? job.title : "the role"}" is now available on your dashboard.`,
      type: "success",
      relatedJobId: assignment.job_id
    }).catch((err) => console.error("Failed to create AI interview notification:", err.message));
    return interview;
  } catch (error) {
    console.error("Failed to activate AI interview after assessment pass:", error.message);
    return null;
  }
};
const startInterview = async (interviewId, candidateId) => {
  const interview = await aiInterviewModel.startInterview(interviewId, candidateId);
  if (!interview) return null;
  await aiInterviewModel.markInterviewInProgressOnApplication(interview.application_id);
  const existingQuestions = await aiInterviewModel.getQuestionsForInterview(interviewId);
  if (existingQuestions.length > 0) {
    const lastQuestion = existingQuestions[existingQuestions.length - 1];
    return {
      interview,
      question: lastQuestion,
      isNew: false
    };
  }
  const questionText = await generateInterviewQuestion({
    jobRole: interview.job_role,
    skills: interview.candidate_skills,
    experience: interview.candidate_experience,
    assessmentPercentage: interview.assessment_percentage,
    questionNumber: 1,
    totalQuestions: interview.total_questions,
    previousExchanges: []
  });
  const question = await aiInterviewModel.addQuestion(interviewId, 1, questionText);
  await aiInterviewModel.incrementQuestionsAsked(interviewId);
  return { interview, question, isNew: true };
};
const submitAnswerAndAdvance = async (interviewId, candidateId, questionId, answerText) => {
  const interview = await aiInterviewModel.getInterviewForCandidate(interviewId, candidateId);
  if (!interview) return { error: "not_found" };
  if (interview.status === "Completed") return { error: "already_completed", interview };
  const currentQuestions = await aiInterviewModel.getQuestionsForInterview(interviewId);
  const currentQuestion = currentQuestions.find((q) => String(q.id) === String(questionId));
  const evaluation = await evaluateInterviewAnswer({
    jobRole: interview.job_role,
    skills: interview.candidate_skills,
    experience: interview.candidate_experience,
    questionText: currentQuestion ? currentQuestion.question_text : "",
    answerText,
    questionNumber: currentQuestion ? currentQuestion.question_order : currentQuestions.length + 1,
    totalQuestions: interview.total_questions
  });
  const questionScore = computeQuestionScore(evaluation);
  await aiInterviewModel.saveAnswer(questionId, interviewId, answerText, {
    technicalScore: evaluation.technical,
    communicationScore: evaluation.communication,
    pronunciationScore: evaluation.pronunciation,
    questionScore,
    feedback: evaluation.feedback
  });
  const questions = await aiInterviewModel.getQuestionsForInterview(interviewId);
  const answeredCount = questions.filter((q) => q.candidate_answer && q.candidate_answer.trim()).length;
  const totalQuestions = interview.total_questions;
  if (answeredCount >= totalQuestions) {
    const finalInterview = await finalizeInterview(interview, questions);
    return { interview: finalInterview, questions, isComplete: true };
  }
  const nextOrder = questions.length + 1;
  const questionText = await generateInterviewQuestion({
    jobRole: interview.job_role,
    skills: interview.candidate_skills,
    experience: interview.candidate_experience,
    assessmentPercentage: interview.assessment_percentage,
    questionNumber: nextOrder,
    totalQuestions,
    previousExchanges: questions.map((q) => ({ question: q.question_text, answer: q.candidate_answer }))
  });
  const nextQuestion = await aiInterviewModel.addQuestion(interviewId, nextOrder, questionText);
  await aiInterviewModel.incrementQuestionsAsked(interviewId);

  return { interview, question: nextQuestion, isComplete: false };
};
const average = (values) => {
  const valid = values.filter((v) => v != null && Number.isFinite(Number(v)));
  if (!valid.length) return 0;
  const sum = valid.reduce((acc, v) => acc + Number(v), 0);
  return Math.round((sum / valid.length) * 100) / 100;
};
const buildAggregateFeedback = (questions) => {
  const answered = questions.filter((q) => q.candidate_answer && q.candidate_answer.trim());
  if (!answered.length) {
    return {
      feedback: "The candidate did not provide any recorded answers during this interview.",
      strengths: "None identified.",
      weaknesses: "No answers were captured to evaluate.",
      suggestions: "Ensure a stable microphone connection and attempt every question."
    };
  }
  const strong = answered.filter((q) => Number(q.question_score) >= MARKS_PER_QUESTION * 0.7);
  const weak = answered.filter((q) => Number(q.question_score) < MARKS_PER_QUESTION * 0.4);
  return {
    feedback: `The candidate answered ${answered.length} of ${questions.length} questions. ${answered
      .map((q) => q.question_feedback)
      .filter(Boolean)
      .join(" ")}`.trim(),
    strengths:
      strong.length > 0
        ? `Strong responses on question ${strong.map((q) => q.question_order).join(", ")}.`
        : "Consistent effort across all questions.",
    weaknesses:
      weak.length > 0
        ? `Weaker responses on question ${weak.map((q) => q.question_order).join(", ")}.`
        : "No significant weak points identified.",
    suggestions: "Continue practicing clear, structured, technically detailed answers."
  };
};
const finalizeInterview = async (interview, questions, { autoSubmitted = false, terminationReason = null } = {}) => {
  const overall = Math.max(
    0,
    Math.min(interview.total_marks || 100, questions.reduce((acc, q) => acc + Number(q.question_score || 0), 0))
  );
  const result = overall >= TECHNICAL_INTERVIEW_THRESHOLD ? "Pass" : "Fail";
  let decision;
  if (overall >= SELECT_THRESHOLD) {
    decision = "Selected";
  } else if (overall >= TECHNICAL_INTERVIEW_THRESHOLD) {
    decision = "Technical Interview";
  } else {
    decision = "Rejected";
  }
  const aggregate = buildAggregateFeedback(questions);
  const updatedInterview = await aiInterviewModel.finalizeInterview(interview.id, {
    technicalScore: average(questions.map((q) => q.technical_score)),
    communicationScore: average(questions.map((q) => q.communication_score)),
    pronunciationScore: average(questions.map((q) => q.pronunciation_score)),
    overallScore: overall,
    result,
    decision,
    feedback: aggregate.feedback,
    strengths: aggregate.strengths,
    weaknesses: aggregate.weaknesses,
    suggestions: aggregate.suggestions,
    autoSubmitted,
    terminationReason
  });
  await applyDecision(updatedInterview, decision);
  return updatedInterview;
};
const forceSubmitInterview = async (interviewId, candidateId, reason) => {
  const interview = await aiInterviewModel.getInterviewForCandidate(interviewId, candidateId);
  if (!interview) return { error: "not_found" };
  if (interview.status === "Completed") return { interview };
  if (interview.status !== "In Progress") return { error: "not_in_progress" };
  const questions = await aiInterviewModel.getQuestionsForInterview(interviewId);
  const finalInterview = await finalizeInterview(interview, questions, {
    autoSubmitted: true,
    terminationReason: reason || "auto_submit"
  });
  return { interview: finalInterview };
};
const recordViolation = async (interviewId, candidateId, type) => {
  const interview = await aiInterviewModel.getInterviewForCandidate(interviewId, candidateId);
  if (!interview) return { error: "not_found" };
  if (interview.status !== "In Progress") return { error: "not_in_progress" };
  const updated = await aiInterviewModel.recordViolation(interviewId, candidateId, type);
  const count = type === "fullscreen" ? updated.fullscreen_violations : updated.tab_violations;
  if (count >= 2) {
    const result = await forceSubmitInterview(interviewId, candidateId, `${type}_violation`);
    return { interview: result.interview, count, autoSubmitted: true };
  }
  return { interview: updated, count, autoSubmitted: false };
};
const applyDecision = async (interview, decision) => {
  const job = await findJobById(interview.job_id).catch(() => null);
  const jobTitle = (job && job.title) || "the role";
  const candidateEmail = interview.candidate_email;
  const candidateName = interview.candidate_name;
  if (decision === "Selected") {
    await aiInterviewModel.updateApplicationStatusForInterview(interview.application_id, "Selected");
    createNotification(interview.candidate_id, {
      title: "You're Selected!",
      message: `Congratulations! You passed the AI Interview for "${jobTitle}" with a score of ${interview.overall_score}%. A job offer has been generated.`,
      type: "success",
      relatedJobId: interview.job_id
    }).catch((err) => console.error("Failed to create selection notification:", err.message));
    await sendEmail(
      candidateEmail,
      "Congratulations! Job Offer - SHNOOR Job Portal",
      `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2>Congratulations, ${candidateName}!</h2>
        <p>
          We are thrilled to inform you that you have successfully cleared the AI Interview for
          <strong>${jobTitle}</strong> with an overall score of <strong>${interview.overall_score}%</strong>.
        </p>
        <p>Based on your outstanding performance, we are pleased to extend a <strong>Job Offer</strong> to you. No further technical interview is required.</p>
        <p>Our recruitment team will reach out shortly with the formal offer letter and onboarding details.</p>
        <a href="${CLIENT_URL}/user/applied"
          style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
          View Application
        </a>
        <br><br>
        Regards,<br>
        <strong>SHNOOR Recruitment Team</strong>
      </div>`
    );
  } else if (decision === "Technical Interview") {
    await aiInterviewModel.updateApplicationStatusForInterview(interview.application_id, "Technical Interview");
    createNotification(interview.candidate_id, {
      title: "AI Interview Passed - Technical Interview Next",
      message: `You passed the AI Interview for "${jobTitle}" with a score of ${interview.overall_score}%. You've been moved to the Technical Interview round.`,
      type: "success",
      relatedJobId: interview.job_id
    }).catch((err) => console.error("Failed to create technical-interview notification:", err.message));
    await sendEmail(
      candidateEmail,
      "AI Interview Passed - Technical Interview Scheduled Next",
      `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2>Well done, ${candidateName}!</h2>
        <p>
          You have successfully passed the AI Interview for <strong>${jobTitle}</strong> with an overall score of
          <strong>${interview.overall_score}%</strong>.
        </p>
        <p>You will now proceed to a <strong>Technical Interview</strong> with our recruitment team. They will reach out shortly to schedule a convenient time.</p>
        <a href="${CLIENT_URL}/user/applied"
          style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
          View Application
        </a>
        <br><br>
        Regards,<br>
        <strong>SHNOOR Recruitment Team</strong>
      </div>`
    );
  } else {
    await aiInterviewModel.updateApplicationStatusForInterview(interview.application_id, "AI Interview Failed");
    createNotification(interview.candidate_id, {
      title: "AI Interview Result",
      message: `Thank you for completing the AI Interview for "${jobTitle}". Unfortunately you did not meet the required score this time (${interview.overall_score}%).`,
      type: "warning",
      relatedJobId: interview.job_id
    }).catch((err) => console.error("Failed to create rejection notification:", err.message));
    await sendEmail(
      candidateEmail,
      "AI Interview Result - SHNOOR Job Portal",
      `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2>AI Interview Result</h2>
        <p>Dear ${candidateName},</p>
        <p>
          Thank you for taking the time to complete the AI Interview for <strong>${jobTitle}</strong>.
        </p>
        <p>
          After careful evaluation, we regret to inform you that you have not been selected to move forward at this time
          (overall score: ${interview.overall_score}%).
        </p>
        <p>We appreciate your interest and encourage you to apply for future opportunities with us.</p>
        <br>
        Regards,<br>
        <strong>SHNOOR Recruitment Team</strong>
      </div>`
    );
  }
};
module.exports = {
  TOTAL_QUESTIONS,
  activateAfterAssessmentPass,
  startInterview,
  submitAnswerAndAdvance,
  forceSubmitInterview,
  recordViolation
};
