// src/context/WishlistContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import api from '@/service/api'

export const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/users/favorites')
      setWishlist(res.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách yêu thích:', error)
    }
  }
  useEffect(() => {

    const token = localStorage.getItem('accessToken')
    if (token) fetchWishlist()
  }, [])

  const toggleWishlist = async (productId) => {
    try {
      const res = await api.post(`/users/toggle-favorite/${productId}`)
      setWishlist(res.data.favorites || [])
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error)
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}
