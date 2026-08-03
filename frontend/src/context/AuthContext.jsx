import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"
import { CartContext } from "./CartContext"
import { WishlistContext } from "./WishlistContext"
import { connectSocket, disconnectSocket } from "@/service/socket"
import apiUser from "@/service/api"
import axios from 'axios'

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : process.env.REACT_APP_API_URL || "http://localhost:4000"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const cartCtx = useContext(CartContext)
  const wishCtx = useContext(WishlistContext)
  const fetchCart = cartCtx?.fetchCart
  const fetchWishlist = wishCtx?.fetchWishlist

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user") || sessionStorage.getItem("user")
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const [ready, setReady] = useState(false)

  // On mount: try refresh session before rendering children to avoid
  // protected calls from components when stored user/token are stale.
  useEffect(() => {
    let mounted = true
    const doRefresh = async () => {
      try {
        // Use raw axios to avoid interceptor auto-redirect behavior here
        const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
        const { accessToken } = res.data || {}
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken)
        }
      } catch (err) {
        // Refresh failed -> clear saved user/token so child components won't call protected APIs
        if (mounted) {
          setUser(null)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('user')
        }
      } finally {
        if (mounted) setReady(true)
      }
    }

    doRefresh()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (user?.id) connectSocket(user.id)
  }, [user?.id])

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
      sessionStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("accessToken")
    }
  }, [user])

  const login = useCallback((userData) => {
    setUser(userData)
    connectSocket(userData?.id)
  }, [])

  const logout = useCallback(async () => {
    try { await apiUser.post("/auth/logout") } catch {}
    setUser(null)
    disconnectSocket()
  }, [])

  // Memoize value to prevent infinite re-render
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {ready ? children : null}
    </AuthContext.Provider>
  )
}
