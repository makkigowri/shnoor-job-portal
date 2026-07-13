import adminApi from "./adminApi";

export const fetchAdminJobs = async (params) => {
  const { data } = await adminApi.get("/admin/jobs", { params });
  return data;
};

export const fetchAdminJobById = async (id) => {
  const { data } = await adminApi.get(`/admin/jobs/${id}`);
  return data;
};

export const updateAdminJobStatus = async (id, status) => {
  const { data } = await adminApi.patch(`/admin/jobs/${id}/status`, { status });
  return data;
};

export const deleteAdminJob = async (id) => {
  const { data } = await adminApi.delete(`/admin/jobs/${id}`);
  return data;
};
