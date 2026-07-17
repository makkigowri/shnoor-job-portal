import api from "./api";
export const getAssessments = async (filters = {}) => {
  const { data } = await api.get("/assessments", { params: filters });
  return data;
};
export const getAssessmentById = async (id) => {
  const { data } = await api.get(`/assessments/${id}`);
  return data;
};
export const createAssessment = async (payload) => {
  const { data } = await api.post("/assessments", payload);
  return data;
};
export const updateAssessment = async (id, payload) => {
  const { data } = await api.put(`/assessments/${id}`, payload);
  return data;
};
export const deleteAssessment = async (id) => {
  const { data } = await api.delete(`/assessments/${id}`);
  return data;
};
export const publishAssessment = async (id) => {
  const { data } = await api.patch(`/assessments/${id}/publish`);
  return data;
};
export const closeAssessment = async (id) => {
  const { data } = await api.patch(`/assessments/${id}/close`);
  return data;
};
export const getAssessmentResults = async (assessmentId) => {
  const { data } = await api.get(`/assessment-submissions/assessment/${assessmentId}/results`);
  return data;
};
export const getSubmissionDetail = async (submissionId) => {
  const { data } = await api.get(`/assessment-submissions/${submissionId}`);
  return data;
};
export const getPendingAssessments = async () => {
  const { data } = await api.get("/assessment-assignments/candidate/pending");
  return data;
};
export const getUpcomingAssessments = async () => {
  const { data } = await api.get("/assessment-assignments/candidate/upcoming");
  return data;
};
export const getCompletedAssessments = async () => {
  const { data } = await api.get("/assessment-assignments/candidate/completed");
  return data;
};
export const getCandidateAssignmentById = async (assignmentId) => {
  const id = Number(assignmentId);
  const [pending, upcoming, completed] = await Promise.all([
    getPendingAssessments(),
    getUpcomingAssessments(),
    getCompletedAssessments()
  ]);
  const all = [
    ...(pending.assessments || []),
    ...(upcoming.assessments || []),
    ...(completed.assessments || [])
  ];
  return all.find((a) => a.id === id) || null;
};
export const startCandidateAssessment = async (assignmentId) => {
  const { data } = await api.post(`/assessment-submissions/start/${assignmentId}`);
  return data;
};
export const saveAssessmentAnswers = async (submissionId, answers) => {
  const { data } = await api.patch(`/assessment-submissions/${submissionId}/save`, { answers });
  return data;
};
export const submitCandidateAssessment = async (submissionId, answers) => {
  const { data } = await api.post(`/assessment-submissions/${submissionId}/submit`, { answers });
  return data;
};
export const autoSubmitCandidateAssessment = async (submissionId, answers) => {
  const { data } = await api.post(`/assessment-submissions/${submissionId}/auto-submit`, { answers });
  return data;
};
export const getMySubmission = async (submissionId) => {
  const { data } = await api.get(`/assessment-submissions/mine/${submissionId}`);
  return data;
};
