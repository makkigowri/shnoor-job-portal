import adminApi from "./adminApi";

export const sendAdminNotification = async (payload) => {
  const { data } = await adminApi.post("/admin/notifications", payload);
  return data;
};

export const fetchNotificationHistory = async () => {
  const { data } = await adminApi.get("/admin/notifications");
  return data;
};

export const deleteAdminNotification = async (id) => {
  const { data } = await adminApi.delete(`/admin/notifications/${id}`);
  return data;
};
