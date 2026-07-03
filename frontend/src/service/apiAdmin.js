// src/service/apiAdmin.js
import axios from "axios"
const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : process.env.REACT_APP_API_URL || "http://localhost:4000"

const apiAdmin = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshingAdmin = false
let failedQueueAdmin = []

const processQueueAdmin = (error, token = null) => {
  failedQueueAdmin.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueueAdmin = []
}

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
  async (error) => {
    const originalRequest = error.config

    // Tránh vòng lặp vô tận nếu chính API refresh-admin bị 401
    if (error.response && error.response.status === 401 && originalRequest.url.includes('/auth/refresh-admin')) {
      sessionStorage.removeItem("accessToken")
      sessionStorage.removeItem("user")
      window.location.href = "/login/admin"
      return Promise.reject(error)
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshingAdmin) {
        return new Promise((resolve, reject) => {
          failedQueueAdmin.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Admin ${token}`
            return apiAdmin(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshingAdmin = true

      try {
        const response = await axios.post(
          `${baseURL}/auth/refresh-admin`,
          {},
          { withCredentials: true }
        )
        const { accessToken } = response.data

        sessionStorage.setItem("accessToken", accessToken)
        originalRequest.headers.Authorization = `Admin ${accessToken}`
        
        processQueueAdmin(null, accessToken)
        return apiAdmin(originalRequest)
      } catch (err) {
        processQueueAdmin(err, null)
        sessionStorage.removeItem("accessToken")
        sessionStorage.removeItem("user")
        window.location.href = "/login/admin"
        return Promise.reject(err)
      } finally {
        isRefreshingAdmin = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiAdmin
