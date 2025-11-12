import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Heart, Star, Gift, Package } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import api from '@/service/api'
import { toast } from 'react-toastify'
import { CartContext } from '@/context/CartContext'

const CartPage = () => {
  const navigate = useNavigate()
  const [cart, setCarts] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { fetchCart, setCart } = useContext(CartContext)

  const fetchCarts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/cart')
      setCarts(res.data)
      setCart(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Lấy giỏ hàng thất bại')
    } finally {
      setTimeout(() => setIsLoading(false), 800)
    }
  }, [setCart])

  useEffect(() => {
    fetchCarts()
  }, [fetchCarts])

  const removeItem = useCallback(async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      fetchCarts()
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }, [fetchCarts])

const updateQuantity = useCallback(async (itemId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(itemId)
    return
  }
  try {
    const res = await api.patch(`/cart/update/${itemId}`, { quantity: newQuantity })
    setCarts(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ),
      subtotal: prev.items.reduce((sum, item) =>
        item._id === itemId ? sum + item.product.sellingPrice * newQuantity : sum + item.product.sellingPrice * item.quantity
      , 0),
      total: prev.total // update total nếu cần
    }))
    setCart(res.data)

  } catch (err) {
    toast.error(err?.response?.data?.message || 'Cập nhật thất bại')
  }
}, [removeItem])


  const cartItems = useMemo(() => cart?.items || [], [cart?.items])
  const subtotal = useMemo(() => cart?.subtotal || 0, [cart?.subtotal])
  const shipping = useMemo(() => cart?.shipping || 0, [cart?.shipping])
  const total = useMemo(() => cart?.total || 0, [cart?.total])

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-full w-64"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-12 animate-fadeIn">
            <div className="inline-flex p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6 animate-bounce">
              <ShoppingBag className="w-16 h-16 text-purple-400" />
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Hãy khám phá và thêm những sản phẩm yêu thích vào giỏ hàng của bạn!
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Khám phá ngay
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-[1550px]">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 mb-8 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow-sm border border-white/20 w-fit animate-slideDown">
          <span 
            className="cursor-pointer hover:text-pink-500 transition-colors font-semibold" 
            onClick={() => navigate('/')}
          >
            Trang chủ
          </span>
          <ArrowRight className="w-4 h-4 mx-3 text-gray-400" />
          <span className="text-gray-900 font-bold">Giỏ hàng</span>
        </nav>

        {/* Header */}
        <div className="mb-8 animate-slideDown" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Giỏ hàng của bạn
              </h1>
              <p className="text-gray-600 text-sm mt-1 font-medium">
                {cartItems.length} sản phẩm đang chờ thanh toán
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.map((item, index) => (
              <div 
                key={item._id} 
                className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl hover:border-pink-200 transition-all duration-300 animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="relative w-full sm:w-28 h-28 flex-shrink-0">
                    <img
                      src={item.product?.mainImage || item.productImage || 'https://via.placeholder.com/150'}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-pink-600 transition-colors line-clamp-2">
                          {item.productName}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                            <span className="text-xs font-semibold text-gray-700">Size:</span>
                            <span className="text-xs font-black text-pink-600">{item.size}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                            <span className="text-xs font-semibold text-gray-700">Màu:</span>
                            <span className="text-xs font-black text-blue-600">{item.color}</span>
                          </div>
                        </div>

                        <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          {item?.product?.sellingPrice?.toLocaleString('vi-VN')}₫
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full w-10 h-10 transition-all duration-200 active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center bg-white rounded-full border-2 border-gray-200 shadow-sm hover:border-pink-300 hover:shadow-md transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item?._id, item.quantity - 1)}
                            className="rounded-full w-10 h-10 hover:bg-pink-50 hover:text-pink-600 active:scale-90 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-2 min-w-[60px] text-center font-black text-lg">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item?._id, item.quantity + 1)}
                            className="rounded-full w-10 h-10 hover:bg-pink-50 hover:text-pink-600 active:scale-90 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sticky top-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Tổng đơn hàng</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-bold text-gray-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Phí vận chuyển</span>
                  <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>

                {shipping > 0 && subtotal < 500000 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">Ưu đãi vận chuyển</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      Mua thêm <span className="font-black">{(500000 - subtotal).toLocaleString('vi-VN')}₫</span> để được miễn phí vận chuyển
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / 500000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  <span className="mr-2">Thanh toán ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 font-bold py-3 rounded-2xl transition-all duration-300 active:scale-95"
                  onClick={() => navigate('/')}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Tiếp tục mua sắm
                </Button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default CartPage