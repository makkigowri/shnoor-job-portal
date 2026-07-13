import api from "./api";
export const getMyProfile = async () => {
  const { data } = await api.get("/profile");
  return data;
};
export const saveMyProfile = async (payload) => {
  const { data } = await api.put("/profile", payload);
  return data;
};
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("profilePhoto", file);
  const { data } = await api.post("/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
