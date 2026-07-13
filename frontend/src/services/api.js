import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api"
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shnoor_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("shnoor_token");
      localStorage.removeItem("shnoor_user");
    }
    return Promise.reject(error);
  }
);
export default api;
