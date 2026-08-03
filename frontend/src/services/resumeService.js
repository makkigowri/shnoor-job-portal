import api from "./api";
export const getMyResume = async () => {
  const { data } = await api.get("/resume");
  return data;
};
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.post("/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
export const deleteResume = async () => {
  const { data } = await api.delete("/resume");
  return data;
};
export const getMyResumes = async () => {
  const { data } = await api.get("/resume/all");
  return data;
};
export const addResume = async (file, resumeName) => {
  const formData = new FormData();
  formData.append("resume", file);
  if (resumeName) formData.append("resumeName", resumeName);
  const { data } = await api.post("/resume/add", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
export const replaceResumeById = async (id, file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.put(`/resume/${id}/replace`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
export const setDefaultResumeById = async (id) => {
  const { data } = await api.put(`/resume/${id}/default`);
  return data;
};
export const deleteResumeById = async (id) => {
  const { data } = await api.delete(`/resume/${id}`);
  return data;
};
export const downloadResumeById = async (id) => {
  const response = await api.get(`/resume/${id}/download`, { responseType: "blob" });
  return response;
};
