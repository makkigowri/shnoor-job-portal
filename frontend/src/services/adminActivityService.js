import adminApi from "./adminApi";
export const fetchAdminActivity = async () => {
  const { data } = await adminApi.get("/admin/notifications");
  return data;
};
export const markAdminActivityRead = async (key) => {
  const { data } = await adminApi.patch("/admin/notifications/read", { key });
  return data;
};
export const markAllAdminActivityRead = async () => {
  const { data } = await adminApi.patch("/admin/notifications/read-all");
  return data;
};
export const markAdminActivityCategoryRead = async (category) => {
  const { data } = await adminApi.patch("/admin/notifications/read-category", { category });
  return data;
};
