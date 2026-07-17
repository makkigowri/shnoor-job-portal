import api from "./api";

export const getEligibleForScheduling = async () => {
  const { data } = await api.get("/technical-interview/eligible");
  return data;
};

export const scheduleTechnicalInterview = async (payload) => {
  const { data } = await api.post("/technical-interview/schedule", payload);
  return data;
};

export const getRecruiterTechnicalInterviews = async (filters = {}) => {
  const { data } = await api.get("/technical-interview/recruiter", { params: filters });
  return data;
};

export const getMyTechnicalInterviews = async () => {
  const { data } = await api.get("/technical-interview/my");
  return data;
};

export const getMeetingRoom = async (roomCode) => {
  const { data } = await api.get(`/technical-interview/room/${roomCode}`);
  return data;
};

export const joinMeetingRoom = async (roomCode) => {
  const { data } = await api.post(`/technical-interview/room/${roomCode}/join`);
  return data;
};

export const endMeetingRoom = async (roomCode) => {
  const { data } = await api.post(`/technical-interview/room/${roomCode}/end`);
  return data;
};

export const submitTechnicalInterviewResult = async (interviewId, payload) => {
  const { data } = await api.post(`/technical-interview/${interviewId}/result`, payload);
  return data;
};
