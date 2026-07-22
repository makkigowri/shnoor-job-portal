import adminApi from "./adminApi";
export const globalSearchAdmin = async (query) => {
  const { data } = await adminApi.get("/admin/search", { params: { q: query } });
  return data;
};
