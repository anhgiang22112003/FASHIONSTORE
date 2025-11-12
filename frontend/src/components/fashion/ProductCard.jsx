import React, { useState, useContext, useEffect } from 'react'
import { Star, Heart, ShoppingBag } from 'lucide-react'
import { Button } from '../ui/button'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/Authcontext'
import { toast } from 'react-toastify'
import api from '@/service/api'
import SideCartDrawer from './SideCartDrawer'
const VariantSelectionModal = React.lazy(() => import('./VariantSelectionModal'))

const ProductCard = ({ product, viewMode, onClick }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
  const [favorites, setFavorites] = React.useState([])
  const { fetchWishlist } = useContext(WishlistContext)
  const { user } = useContext(AuthContext)

  const price = product?.sellingPrice || 0
  const originalPrice = product?.originalPrice || 0
  const rating = product?.ratingAverage || 4
  const reviews = product?.reviewCount || 0
  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true)
  }
  const discountPercentage =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  const getFavorites = async () => {
    try {
      const res = await api.get('/users/favorites')
      const ids = (res.data || []).map((p) => p._id ?? p.id)
      setFavorites(ids)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }
  useEffect(() => {
    if (user) {
      getFavorites()
    }
  }, [user])

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

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col sm:flex-row gap-6 bg-white rounded-2xl shadow-lg border-2 border-pink-100 p-6 hover:shadow-2xl hover:border-pink-300 transition-all duration-300 group">
        <div className="w-full sm:w-40 h-40 flex-shrink-0">
          <img
            src={product?.mainImage}
            alt={product?.name}
            className="w-full h-full object-cover rounded-xl cursor-pointer group-hover:scale-105 transition-transform duration-300"
            onClick={onClick}
          />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-2 cursor-pointer hover:text-pink-500 transition-colors text-lg line-clamp-2" onClick={onClick}>
              {product?.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product?.shortDescription}</p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating)
                      ? 'text-pink-500 fill-pink-500'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">({reviews})</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-pink-500">
                {price?.toLocaleString('vi-VN')}đ
              </span>
              {originalPrice > price && (
                <>
                  <span className="text-sm text-gray-500 line-through font-medium">
                    {originalPrice?.toLocaleString('vi-VN')}đ
                  </span>
                  {discountPercentage && (
                    <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPercentage}%
                    </span>
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFavorite}
              className={`border-2 ${isLiked
                ? 'border-pink-500 bg-pink-50 text-pink-500 hover:bg-pink-100'
                : 'border-pink-200 text-gray-600 hover:border-pink-500 hover:bg-pink-50'
                } transition-all`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white rounded-2xl shadow-lg border-2 border-pink-100 hover:shadow-2xl hover:border-pink-300 transition-all duration-500 overflow-hidden">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product?.mainImage}
          alt={product?.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
          onClick={onClick}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-3 left-3 bg-pink-500 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg animate-pulse">
            -{discountPercentage}% OFF
          </div>
        )}

        {/* Favorite Button */}
        <Button
          size="sm"
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
    ${favorites.includes(product._id)
              ? 'bg-pink-500 text-white scale-110'
              : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500'
            }`}
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(product._id)
          }}
        >
          <Heart
            className={`w-5 h-5 ${favorites.includes(product._id) ? 'fill-white' : ''
              }`}
          />
        </Button>


        {/* Add to Cart Button - Show on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <Button
            size="lg"
            className="w-full bg-pink-500 text-white font-bold rounded-xl shadow-xl hover:bg-pink-600 border-none"
            onClick={(e) => {
              setSelectedProduct(product)
              setIsVariantModalOpen(true)
            }}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 cursor-pointer hover:text-pink-500 transition-colors line-clamp-2 text-base" onClick={onClick}>
          {product?.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.floor(rating)
                ? 'text-pink-500 fill-pink-500'
                : 'text-gray-300'
                }`}
            />
          ))}
          <span className="text-xs text-gray-600 ml-1 font-medium">({reviews})</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl font-black text-pink-500">
            {price?.toLocaleString('vi-VN')}đ
          </span>
          {originalPrice > price && (
            <span className="text-sm text-gray-500 line-through font-medium">
              {originalPrice?.toLocaleString('vi-VN')}đ
            </span>
          )}
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
    </div>
  )
}

export default ProductCard
