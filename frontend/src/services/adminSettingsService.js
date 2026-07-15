import adminApi from "./adminApi";
export const fetchAdminSettings = async () => {
  const { data } = await adminApi.get("/admin/settings");
  return data;
};
export const saveAdminSettings = async (payload) => {
  const { data } = await adminApi.put("/admin/settings", payload);
  return data;
};
export const uploadAdminLogo = async (formData) => {
  const { data } = await adminApi.post("/admin/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
export const changeSettingsPassword = async (payload) => {
  const { data } = await adminApi.put("/admin/settings/change-password", payload);
  return data;
};
