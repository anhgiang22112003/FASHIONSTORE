import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import api from "@/service/api"
import { Heart, Trash2, ShoppingBag, Star, Sparkles } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import VariantSelectionModal from "@/components/fashion/VariantSelectionModal"
import SideCartDrawer from "@/components/fashion/SideCartDrawer"
import { Link } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import ProductCard from "@/components/fashion/ProductCard"

const Wishlist = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true)
  }

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/users/favorites")
      setProducts(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Không thể tải danh sách yêu thích 💔")
    }
  }

  useEffect(() => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để xem danh sách yêu thích')
      navigate('/login')
      return
    }
    fetchFavorites()
  }, [user, navigate])

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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products?.map((product, index) => (
              <ProductCard
                key={product?._id || product?.id || index}
                product={product}
                index={index}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFavorite(product._id || product.id)}
                onAddToCart={(p) => {
                  setSelectedProduct(p)
                  setIsVariantModalOpen(true)
                }}
              />
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