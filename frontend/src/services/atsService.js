import api from "./api";
export const analyzeResume = async (jobId, file) => {
  const formData = new FormData();
  formData.append("jobId", jobId);
  formData.append("resume", file);
  const { data } = await api.post("/ats/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
