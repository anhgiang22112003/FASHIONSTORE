// src/service/apiUser.js
import axios from "axios"
const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : process.env.REACT_APP_API_URL || "http://localhost:4000"

const apiUser = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

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
  async (error) => {
    const originalRequest = error.config

    // Tránh vòng lặp vô tận nếu chính API refresh bị 401
    if (error.response && error.response.status === 401 && originalRequest.url.includes('/auth/refresh')) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
      return Promise.reject(error)
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiUser(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const { accessToken } = response.data

        localStorage.setItem("accessToken", accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        
        processQueue(null, accessToken)
        return apiUser(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiUser
