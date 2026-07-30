import React, { createContext, useState, useEffect } from 'react'
import api from '@/service/api'
import { toast } from 'react-toastify'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
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

      await api.post('/cart/add', body)
      toast.success('Đã thêm vào giỏ hàng')
      await fetchCart()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng')
      throw error
    }
  }

  // Cập nhật số lượng tức thì (Optimistic UI Update) - Đồng bộ tất cả giao diện giỏ hàng
  const updateQuantity = async (itemId, newQuantity) => {
    if (!cart) return

    const previousCart = { ...cart }

    // 1. Cập nhật state local ngay tức thì cho cả 2 giỏ hàng (Drawer & CartPage)
    setCart(prev => {
      if (!prev) return prev
      const updatedItems = prev.items.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
      const updatedSubtotal = updatedItems.reduce(
        (sum, item) => sum + (item.price ?? item.product?.sellingPrice ?? 0) * item.quantity,
        0
      )
      return {
        ...prev,
        items: updatedItems,
        subtotal: updatedSubtotal,
        total: updatedSubtotal + (prev.shipping || 0)
      }
    })

    // 2. Gửi request PATCH ngầm lưu DB (Không cần re-fetch api.get('/cart'))
    try {
      await api.patch(`/cart/update/${itemId}`, { quantity: newQuantity })
    } catch (error) {
      // Revert lại nếu có lỗi
      setCart(previousCart)
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng tức thì
  const removeFromCart = async (itemId) => {
    if (!cart) return

    const previousCart = { ...cart }

    setCart(prev => {
      if (!prev) return prev
      const updatedItems = prev.items.filter(item => item._id !== itemId)
      const updatedSubtotal = updatedItems.reduce(
        (sum, item) => sum + (item.price ?? item.product?.sellingPrice ?? 0) * item.quantity,
        0
      )
      return {
        ...prev,
        items: updatedItems,
        subtotal: updatedSubtotal,
        total: updatedSubtotal + (prev.shipping || 0)
      }
    })

    try {
      await api.delete(`/cart/remove/${itemId}`)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      setCart(previousCart)
      toast.error('Xóa thất bại')
    }
  }

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, fetchCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}
