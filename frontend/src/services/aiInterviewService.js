import api from "./api";
import adminApi from "./adminApi";
export const getMyAiInterviews = async () => {
  const { data } = await api.get("/ai-interview/my");
  return data;
};
export const getAiInterviewByApplication = async (applicationId) => {
  const { data } = await api.get(`/ai-interview/by-application/${applicationId}`);
  return data;
};
export const getAiInterview = async (interviewId) => {
  const { data } = await api.get(`/ai-interview/${interviewId}`);
  return data;
};
export const startAiInterview = async (interviewId) => {
  const { data } = await api.post(`/ai-interview/${interviewId}/start`);
  return data;
};
export const submitAiInterviewAnswer = async (interviewId, questionId, answerText) => {
  const { data } = await api.post(`/ai-interview/${interviewId}/answer`, { questionId, answerText });
  return data;
};
export const getRecruiterAiInterviews = async (filters = {}) => {
  const { data } = await api.get("/ai-interview/recruiter", { params: filters });
  return data;
};
export const getRecruiterAiInterviewDetail = async (interviewId) => {
  const { data } = await api.get(`/ai-interview/recruiter/${interviewId}`);
  return data;
};
export const getAiInterviewAdminStats = async () => {
  const { data } = await adminApi.get("/ai-interview/admin/stats");
  return data;
};
