// src/service/apiChatbot.js
import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : process.env.REACT_APP_API_URL || "https://backend-fashion-r76p.onrender.com";

const apiChatbot = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Nếu có token user thì gắn vào header
apiChatbot.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken")
    if (user?.accessToken) {
      config.headers.Authorization = `Admin ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiChatbot;
