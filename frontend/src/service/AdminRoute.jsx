// service/AdminRoute.js
import React from "react"
import { Navigate } from "react-router-dom"
import apiAdmin from "./apiAdmin"

export const AdminRoute = ({ children }) => {
  const [loading, setLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)

  const token = sessionStorage.getItem("accessToken")
  const user = sessionStorage.getItem("user")

  React.useEffect(() => {
    // Nếu không có token hoặc user -> chuyển hướng ngay
    if (!token || !user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    // Nếu có token thì kiểm tra quyền admin
    apiAdmin
      .get("/auth/profile")
      .then((res) => {
        if (["admin", "staff"].includes(res.data.role)) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      })

      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))
  }, [token, user])

  if (loading) return <div>Đang kiểm tra quyền...</div>
  if (!isAdmin) return <Navigate to="/login/admin" replace />

  return children
}
