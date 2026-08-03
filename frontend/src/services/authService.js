import api from "./api";
export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};
export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};
export const fetchProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};
export const changePassword = async (payload) => {
  const { data } = await api.put("/auth/change-password", payload);
  return data;
};
export const deleteAccount = async (password) => {
  const { data } = await api.delete("/auth/account", { data: { password } });
  return data;
};
