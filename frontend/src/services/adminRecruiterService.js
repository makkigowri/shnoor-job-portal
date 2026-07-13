import adminApi from "./adminApi";

export const fetchRecruiters = async (params) => {
  const { data } = await adminApi.get("/admin/recruiters", { params });
  return data;
};

export const fetchRecruiterById = async (id) => {
  const { data } = await adminApi.get(`/admin/recruiters/${id}`);
  return data;
};

export const blockRecruiter = async (id) => {
  const { data } = await adminApi.patch(`/admin/recruiters/${id}/block`);
  return data;
};

export const unblockRecruiter = async (id) => {
  const { data } = await adminApi.patch(`/admin/recruiters/${id}/unblock`);
  return data;
};

export const deleteRecruiter = async (id) => {
  const { data } = await adminApi.delete(`/admin/recruiters/${id}`);
  return data;
};
