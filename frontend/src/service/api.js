// src/service/apiUser.js
import axios from "axios"

const apiUser = axios.create({
  // baseURL:  process.env.REACT_APP_API_URL || "http://localhost:4000",
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Gắn token từ localStorage
apiUser.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiUser.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default apiUser
