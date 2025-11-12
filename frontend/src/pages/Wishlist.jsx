import React, { useContext, useEffect, useState } from "react"
import api from "@/service/api"
import { Heart, Trash2, ShoppingBag, Star, Sparkles } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import VariantSelectionModal from "@/components/fashion/VariantSelectionModal"
import SideCartDrawer from "@/components/fashion/SideCartDrawer"
import { Link } from "react-router-dom"
import { AuthContext } from "@/context/Authcontext"

const Wishlist = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
  const { user } = useContext(AuthContext)

  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true)
  }
  const getFavorites = async () => {
    try {
      const res = await api.get('/users/favorites')
      const ids = (res.data || []).map((p) => p._id ?? p.id)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }
  useEffect(() => {
    if (user) {
      getFavorites()
    }
  }, [user])


  const fetchFavorites = async () => {
    try {
      const res = await api.get("/users/favorites")
      setProducts(res.data)
    } catch (err) {
      console.error(err)
      toast.error("Không thể tải danh sách yêu thích 💔")
    }
  }

  const handleRemoveFavorite = async (productId) => {
    try {
      await api.delete(`/users/favorites/${productId}`)
      setProducts((prev) => prev.filter((p) => p._id !== productId))
      toast.success("Đã xóa khỏi danh sách yêu thích 💔")
    } catch (err) {
      console.error(err)
      toast.error("Không thể xóa sản phẩm")
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  return (
    <div className=" bg-gradient-to-br from-pink-50 ">
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {products.length} sản phẩm đang chờ bạn
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100">
            <div className="inline-flex p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
              <Heart className="w-16 h-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Chưa có sản phẩm yêu thích
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Hãy khám phá và thêm những sản phẩm bạn yêu thích vào danh sách này!
            </p>
          </div>
        ) : (
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
                      className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 bg-pink-500 text-white scale-110"
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemoveFavorite(product._id)
                      }}
                    >
                      <Heart className="w-5 h-5 fill-white" />
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
                  <Link to={`/product/${product?._id}`}>
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
                          className={`w-4 h-4 ${i < Math.floor(product?.ratingAverage || 0)
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
        )}
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

export default Wishlist