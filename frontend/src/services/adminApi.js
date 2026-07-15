import axios from "axios";
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api"
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("shnoor_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("shnoor_admin_token");
      localStorage.removeItem("shnoor_admin_user");
    }
    return Promise.reject(error);
  }
);
export default adminApi;
