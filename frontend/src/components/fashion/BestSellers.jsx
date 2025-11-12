import React, { useContext, useEffect } from 'react'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '../ui/button'
import api from '@/service/api'
import { Link } from 'react-router-dom'
import SideCartDrawer from './SideCartDrawer'
import { toast } from 'react-toastify'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/Authcontext'

const VariantSelectionModal = React.lazy(() => import('./VariantSelectionModal'))

const BestSellers = () => {
  const [products, setProducts] = React.useState()
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
  const [favorites, setFavorites] = React.useState([])
  const { fetchWishlist } = useContext(WishlistContext)
  const { user } = useContext(AuthContext)

  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true)
  }

  const getBestSellers = async () => {
    try {
      const response = await api.get('/products/best-sellers')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching best sellers:', error)
    }
  }

  const getFavorites = async () => {
    try {
      const res = await api.get('/users/favorites')
      const ids = (res.data || []).map((p) => p._id ?? p.id)
      setFavorites(ids)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const toggleFavorite = async (productId) => {
    try {
      const already = favorites.includes(productId)
      setFavorites(prev => already ? prev.filter(id => id !== productId) : [...prev, productId])
      if (already) {
        await api.delete(`/users/favorites/${productId}`)
        toast.info('Đã xóa khỏi danh sách yêu thích 💔')
        fetchWishlist()
      } else {
        await api.post(`/users/favorites/${productId}`, {})
        toast.success('Đã thêm vào danh sách yêu thích ❤️')
        fetchWishlist()
      }
      await getFavorites()
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
      await getFavorites()
    }
  }

  useEffect(() => {
    const init = async () => {
      await getBestSellers()
    }
    init()
  }, [])

  useEffect(() => {
    if (user) {
      getFavorites()
    }
  }, [user])

  return (
    <section className="py-20 bg-[#FFF5F7] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-pink-300 mb-4 shadow-lg">
            <TrendingUp className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-bold text-black">BEST SELLERS</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-black">
            Sản Phẩm <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Bán Chạy</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những món đồ được yêu thích nhất bởi khách hàng trong 30 ngày qua
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map((product, index) => (
            <div
              key={product?.id}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Product Image */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={product?.mainImage}
                  alt={product?.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Sale Badge */}
                {product?.originalPrice > product?.price && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-400 to-pink-600 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg animate-bounce-in">
                    -{Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)}% OFF
                  </div>
                )}

                {/* Hot Badge */}
                <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  HOT
                </div>

                {/* Action Buttons */}
                <div className="absolute top-20 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <Button
                    size="sm"
                    className={`w-12 h-12 p-0 rounded-full shadow-xl ${
                      favorites.includes(product._id)
                        ? 'bg-gradient-to-r from-pink-400 to-pink-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(product._id)
                    }}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(product._id)
                          ? 'fill-white text-white'
                          : 'text-black'
                      }`}
                    />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold rounded-full shadow-xl hover:shadow-pink-500/50"
                    onClick={(e) => {
                      setSelectedProduct(product)
                      setIsVariantModalOpen(true)
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 bg-white">
                <Link to={`product/${product?._id}`}>
                  <h3 className="font-bold text-black mb-3 line-clamp-2 text-lg group-hover:text-pink-500 transition-colors">
                    {product?.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product?.ratingAverage || 0)
                            ? 'text-pink-500 fill-pink-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">
                    {product?.ratingAverage?.toFixed(1) ?? 0} ({product?.reviewCount ?? 0})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                    {product?.sellingPrice?.toLocaleString('vi-VN')}đ
                  </span>
                  {product.originalPrice > product.sellingPrice && (
                    <span className="text-sm text-gray-500 line-through font-medium">
                      {product?.originalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 animate-slide-up">
          <Link to={"/products"}> 
          <Button 
            variant="outline" 

            size="lg" 
            className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full px-8 py-6 text-lg font-bold group shadow-lg hover:shadow-pink-500/30"
          >
            Xem tất cả sản phẩm
            <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
          </Link>
        </div>
      </div>
      
      {isVariantModalOpen && selectedProduct && (
        <React.Suspense fallback={<div>Đang tải...</div>}>
          <VariantSelectionModal
            product={selectedProduct}
            isOpen={isVariantModalOpen}
            onClose={() => setIsVariantModalOpen(false)}
            onSuccessAndOpenCart={handleSuccessAndOpenCart}
          />
        </React.Suspense>
      )}
      <SideCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </section>
  )
}

export default BestSellers
