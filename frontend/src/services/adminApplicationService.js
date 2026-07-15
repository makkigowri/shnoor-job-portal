import adminApi from "./adminApi";
export const fetchAdminApplications = async (params) => {
  const { data } = await adminApi.get("/admin/applications", { params });
  return data;
};
export const fetchAdminApplicationById = async (id) => {
  const { data } = await adminApi.get(`/admin/applications/${id}`);
  return data;
};
export const deleteAdminApplication = async (id) => {
  const { data } = await adminApi.delete(`/admin/applications/${id}`);
  return data;
};
