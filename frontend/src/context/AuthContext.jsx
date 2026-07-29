import React, { createContext, useState, useEffect, useContext } from "react"
import { CartContext } from "./CartContext"
import { WishlistContext } from "./WishlistContext"
import { connectSocket, disconnectSocket } from "@/service/socket"
import apiUser from "@/service/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const { fetchCart } = useContext(CartContext) || {}
  const { fetchWishlist } = useContext(WishlistContext) || {}
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user")
    return savedUser ? JSON.parse(savedUser) : null
  })

  // Kết nối socket khi có user (khởi tạo hoặc reload trang)
  useEffect(() => {
    if (user?.id) {
      connectSocket(user.id)
    }
  }, [user?.id])

  // Cập nhật localStorage mỗi khi user thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
    }
  }, [user])

  const login = (userData) => {
    setUser(userData)
    connectSocket(userData?.id)
    if (fetchCart) fetchCart()
    if (fetchWishlist) fetchWishlist()
  }

  const logout = async () => {
    try {
      await apiUser.post("/auth/logout")
    } catch (err) {
      console.error("Lỗi khi đăng xuất trên server:", err)
    }
    setUser(null)
    disconnectSocket()
    if (fetchCart) fetchCart()
    if (fetchWishlist) fetchWishlist()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
