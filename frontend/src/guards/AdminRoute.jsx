import React, { useMemo } from "react"
import { Navigate } from "react-router-dom"
import apiAdmin from "@/service/apiAdmin"

export const AdminRoute = ({ children }) => {
  const [loading, setLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
    const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user")
    let user = null
    try { if (userRaw) user = JSON.parse(userRaw) } catch {}

    if (!token || !user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    apiAdmin.get("/auth/profile")
      .then((res) => setIsAdmin(["admin","staff"].includes(res.data.role)))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))
  }, []) // empty deps — only run once on mount

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Đang kiểm tra quyền...</div>
  if (!isAdmin) return <Navigate to="/login/admin" replace />
  return children
}
