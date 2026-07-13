import adminApi from "./adminApi";

export const fetchAdminDashboard = async () => {
  const { data } = await adminApi.get("/admin/dashboard");
  return data;
};

export const fetchAdminAnalytics = async () => {
  const { data } = await adminApi.get("/admin/dashboard/analytics");
  return data;
};
