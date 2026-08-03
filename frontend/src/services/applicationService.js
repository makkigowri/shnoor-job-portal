import api from "./api";
export const getMyApplications = async () => {
  const { data } = await api.get("/applications/my");
  return data;
};
export const applyToJob = async (jobId, resumeId) => {
  const { data } = await api.post(`/applications/${jobId}`, resumeId ? { resumeId } : {});
  return data;
};
export const withdrawApplication = async (jobId) => {
  const { data } = await api.patch(`/applications/${jobId}/withdraw`);
  return data;
};