import api from "./api";
export const getMyCompany = async () => {
  const { data } = await api.get("/company");
  return data;
};
export const saveMyCompany = async (payload) => {
  const { data } = await api.put("/company", payload);
  return data;
};
export const uploadCompanyLogo = async (file) => {
  const formData = new FormData();
  formData.append("companyLogo", file);
  const { data } = await api.post("/company/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
