import adminApi from "./adminApi";
export const sendAdminAnnouncement = async (payload) => {
  const { data } = await adminApi.post("/admin/announcements", payload);
  return data;
};
export const fetchAnnouncementHistory = async () => {
  const { data } = await adminApi.get("/admin/announcements");
  return data;
};
export const deleteAdminAnnouncement = async (id) => {
  const { data } = await adminApi.delete(`/admin/announcements/${id}`);
  return data;
};
