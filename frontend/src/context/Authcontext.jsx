import React, { createContext, useState, useEffect, useContext } from "react"
import { CartContext } from "./CartContext"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
const { fetchCart } = useContext(CartContext) || {};
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user")
    return savedUser ? JSON.parse(savedUser) : null
  })

  // Cập nhật localStorage mỗi khi user thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
    }
  }, [user])

  const login = (userData) => setUser(userData)
  const logout = () => {
    setUser(null)
    fetchCart()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
