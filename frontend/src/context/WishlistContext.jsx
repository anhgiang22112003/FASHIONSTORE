import React, { createContext, useState, useEffect, useMemo } from 'react'
import api from '@/service/api'
import { toast } from 'react-toastify'

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
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.warning('Vui lòng đăng nhập để thêm vào yêu thích')
      return
    }
    try {
      const res = await api.post(`/users/toggle-favorite/${productId}`)
      setWishlist(res.data.favorites || [])
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error)
    }
  }

  const value = useMemo(() => ({ wishlist, setWishlist, toggleWishlist, fetchWishlist }), [wishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
