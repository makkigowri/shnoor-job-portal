import api from "./api";
export const getMyApplications = async () => {
  const { data } = await api.get("/applications/my");
  return data;
};
export const applyToJob = async (jobId) => {
  const { data } = await api.post(`/applications/${jobId}`);
  return data;
};
export const withdrawApplication = async (jobId) => {
  const { data } = await api.patch(`/applications/${jobId}/withdraw`);
  return data;
};