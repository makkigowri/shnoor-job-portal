import adminApi from "./adminApi";

// ---------- Assessment Management ----------
export const fetchAdminAssessments = async (params) => {
  const { data } = await adminApi.get("/admin/assessments", { params });
  return data;
};

export const fetchAdminAssessmentById = async (id) => {
  const { data } = await adminApi.get(`/admin/assessments/${id}`);
  return data;
};

export const deleteAdminAssessment = async (id) => {
  const { data } = await adminApi.delete(`/admin/assessments/${id}`);
  return data;
};

// ---------- Assessment Analytics ----------
export const fetchAdminAssessmentStatistics = async () => {
  const { data } = await adminApi.get("/admin/assessments/stats/overview");
  return data;
};
