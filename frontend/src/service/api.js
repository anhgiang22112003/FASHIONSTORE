// api.js
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:4000", // thay bằng API backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request -> tự gắn token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // hoặc sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response -> bắt lỗi 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token hết hạn hoặc không hợp lệ
      localStorage.removeItem("accessToken");
      window.location.href = "/login"; // điều hướng về login
    }
    return Promise.reject(error);
  }
);

export default api;
