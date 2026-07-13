import api from "./api";
export const getSavedJobs = async () => {
  const { data } = await api.get("/saved-jobs");
  return data;
};
export const saveJob = async (jobId) => {
  const { data } = await api.post(`/saved-jobs/${jobId}`);
  return data;
};
export const removeSavedJob = async (jobId) => {
  const { data } = await api.delete(`/saved-jobs/${jobId}`);
  return data;
};