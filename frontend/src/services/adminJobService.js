import adminApi from "./adminApi";
import { downloadFileFromResponse } from "./exportService";
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
export const exportAdminJobs = async () => {
  const response = await adminApi.get("/admin/jobs/export/all", { responseType: "blob" });
  downloadFileFromResponse(response, "Jobs_Report.xlsx");
};
