// src/service/apiAdmin.js
import axios from "axios"

const apiAdmin = axios.create({
  //  baseURL:  process.env.REACT_APP_API_URL || "http://localhost:4000",
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Lấy token từ sessionStorage (chỉ của admin)
apiAdmin.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Admin ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("accessToken")
      sessionStorage.removeItem("user")
      // window.location.href = "/login/admin"
    }
    return Promise.reject(error)
  }
)

export default apiAdmin
