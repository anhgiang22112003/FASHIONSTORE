import React, { createContext, useState, useEffect } from 'react'
import api from '@/service/api'
import { toast } from 'react-toastify'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken') // hoặc tên token bạn dùng    
    if (token) {
      fetchCart()
    }
  }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')      
      setCart(res.data)
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error)
    }
  }

  const addToCart = async (body) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng')
        return
      }

      const res = await api.post('/cart/add', body)
      toast.success('Đã thêm vào giỏ hàng')
      setCart(res.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng')
    }
  }

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}
