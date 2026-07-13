import api from "./api";
export const searchJobs = async (params) => {
  const { data } = await api.get("/jobs/search", { params });
  return data;
};
export const getJobById = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};
export const getMyJobs = async () => {
  const { data } = await api.get("/jobs/my-jobs");
  return data;
};
export const createJob = async (payload) => {
  const { data } = await api.post("/jobs", payload);
  return data;
};
export const updateJob = async (id, payload) => {
  const { data } = await api.put(`/jobs/${id}`, payload);
  return data;
};
export const deleteJob = async (id) => {
  const { data } = await api.delete(`/jobs/${id}`);
  return data;
};
