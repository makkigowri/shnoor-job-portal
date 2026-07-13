import adminApi from "./adminApi";

export const fetchUsers = async (params) => {
  const { data } = await adminApi.get("/admin/users", { params });
  return data;
};

export const fetchUserById = async (id) => {
  const { data } = await adminApi.get(`/admin/users/${id}`);
  return data;
};

export const blockUser = async (id) => {
  const { data } = await adminApi.patch(`/admin/users/${id}/block`);
  return data;
};

export const unblockUser = async (id) => {
  const { data } = await adminApi.patch(`/admin/users/${id}/unblock`);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await adminApi.delete(`/admin/users/${id}`);
  return data;
};
