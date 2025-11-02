import React, { useState, useEffect, useContext } from 'react'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import api from '@/service/api' // axios instance
import { toast } from 'react-toastify'
import { CartContext } from '@/context/CartContext'

const CartPage = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { fetchCart } = useContext(CartContext)

  const fetchCarts = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/cart')
      setCart(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Lấy giỏ hàng thất bại')
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchCarts()
  }, [])

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      fetchCart()
      fetchCarts()
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    try {
      await api.patch(`/cart/update/${itemId}`, { quantity: newQuantity })
      fetchCart()
      fetchCarts()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại')
    }
  }
  // if (isLoading) {
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
  //       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  //     </div>
  //   )
  // }

  const cartItems = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shipping = cart?.shipping || 0
  const total = cart?.total || 0

  if (!cartItems.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Button onClick={() => navigate('/')} className="bg-pink-500 hover:bg-pink-600">
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <span className="cursor-pointer hover:text-pink-500" onClick={() => navigate('/')}>
          Trang chủ
        </span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Giỏ hàng</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems?.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex gap-4">
                <img
                  src={item.product?.mainImage || item.productImage || 'https://via.placeholder.com/150'}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.productName}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <span>Size: {item.size}</span>
                    <span className="mx-2">•</span>
                    <span>Màu: {item.color}</span>
                  </div>
                  <div className="text-lg font-bold text-pink-500">
                    {item?.product?.sellingPrice?.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item?._id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item?._id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-6">Tổng đơn hàng</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              {/* <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}
                </span>
              </div> */}

              {shipping > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Mua thêm {(500000 - subtotal).toLocaleString('vi-VN')}đ để được miễn phí vận chuyển
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-pink-500">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              size="lg"
              onClick={() => navigate("/checkout")}
            >
              Thanh toán
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
