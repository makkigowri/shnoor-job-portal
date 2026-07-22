import api from "./api";
export const getMyInterviews = async () => {
  const { data } = await api.get("/interviews/my");
  return data;
};