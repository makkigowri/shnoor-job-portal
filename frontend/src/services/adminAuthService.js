import adminApi from "./adminApi";

export const loginAdmin = async (payload) => {
  const { data } = await adminApi.post("/admin/auth/login", payload);
  return data;
};

export const fetchAdminProfile = async () => {
  const { data } = await adminApi.get("/admin/auth/profile");
  return data;
};

export const changeAdminPassword = async (payload) => {
  const { data } = await adminApi.put("/admin/auth/change-password", payload);
  return data;
};
