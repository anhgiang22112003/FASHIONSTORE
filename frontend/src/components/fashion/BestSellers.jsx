import React, { useContext, useEffect } from 'react'
import { Star, ShoppingBag, Heart } from 'lucide-react'
import { Button } from '../ui/button'
import api from '@/service/api'
import { Link } from 'react-router-dom'
import SideCartDrawer from './SideCartDrawer'
import { toast } from 'react-toastify'
import { WishlistContext } from '@/context/WishlistContext'

const VariantSelectionModal = React.lazy(() => import('./VariantSelectionModal'))
const BestSellers = () => {
  const [products, setProducts] = React.useState()
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
    const [favorites, setFavorites] = React.useState([]) // ✅ Danh sách yêu thích
  const { fetchWishlist } = useContext(WishlistContext)

  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true) // Mở Drawer giỏ hàng
  }
  const getBestSellers = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.products)
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
      await getFavorites()
    }
    init()
  }, [])
    // Hàm mở giỏ hàng từ icon

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Sản Phẩm Bán Chạy
          </h2>
          <p className="text-xl text-gray-600">
            Những món đồ được yêu thích nhất bởi khách hàng
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map((product) => (
            <div
              key={product?.id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={product?.mainImage}
                  alt={product?.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Sale Badge */}
                {product?.originalPrice > product?.price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    -{Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)}%
                  </div>
                )}

                {/* Action Buttons */}
               <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`w-8 h-8 p-0 rounded-full ${
                      favorites.includes(product._id)
                        ? 'bg-pink-100 text-pink-500'
                        : 'bg-white text-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(product._id)
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(product._id)
                          ? 'fill-pink-500'
                          : 'fill-transparent'
                      }`}
                    />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <Button
                    size="sm"
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    // Thay đổi: Mở modal thay vì thêm trực tiếp
                    onClick={(e) => {
                      // e.preventDefault(); // Có thể cần chặn nếu nút nằm trong thẻ Link
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
              <div className="p-4">
                <Link to={`product/${product?._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product?.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product?.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product?.rating} ({product?.stock})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-pink-500">
                    {product?.sellingPrice?.toLocaleString('vi-VN')}đ
                  </span>
                  {product.originalPrice > product.sellingPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {product?.originalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-pink-500 text-pink-500 hover:bg-pink-50">
            Xem tất cả sản phẩm
          </Button>
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