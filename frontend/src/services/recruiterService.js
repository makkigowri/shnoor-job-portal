import api from "./api";
import { downloadFileFromResponse } from "./exportService";
export const getApplicants = async (filters = {}) => {
  const { data } = await api.get("/applications/recruiter", { params: filters });
  return data;
};
export const exportApplicants = async (jobId) => {
  const response = await api.get(`/applications/export/job/${jobId}`, { responseType: "blob" });
  downloadFileFromResponse(response, "Applicants.xlsx");
};
export const updateApplicationStatus = async (applicationId, status, recruiterNote) => {
  const { data } = await api.patch(`/applications/${applicationId}/status`, { status, recruiterNote });
  return data;
};
export const scheduleInterview = async (payload) => {
  const { data } = await api.post("/interviews", payload);
  return data;
};
export const getInterviews = async (filters = {}) => {
  const { data } = await api.get("/interviews", { params: filters });
  return data;
};
export const rescheduleInterview = async (interviewId, payload) => {
  const { data } = await api.patch(`/interviews/${interviewId}`, payload);
  return data;
};
export const updateInterviewStatus = async (interviewId, status) => {
  const { data } = await api.patch(`/interviews/${interviewId}/status`, { status });
  return data;
};
export const getRecruiterDashboardSummary = async () => {
  const { data } = await api.get("/dashboard/recruiter");
  return data;
};
