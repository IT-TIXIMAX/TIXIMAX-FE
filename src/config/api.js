import axios from "axios";

const API_BASE_URL =
  // import.meta.env.VITE_API_BASE_URL || "https://tiximax.net/api";
  // import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
  import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 300000,
});

// Tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, Promise.reject);

// Xử lý lỗi chung
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response } = err;
    if (response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
