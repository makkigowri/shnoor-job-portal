import adminApi from "./adminApi";
import { downloadFileFromResponse } from "./exportService";
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
export const exportAdminApplicants = async (jobId) => {
  const response = await adminApi.get(`/admin/applications/export/job/${jobId}`, { responseType: "blob" });
  downloadFileFromResponse(response, "Applicants.xlsx");
};
