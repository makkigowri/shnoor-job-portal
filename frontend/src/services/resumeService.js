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