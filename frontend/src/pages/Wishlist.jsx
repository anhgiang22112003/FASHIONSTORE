import React, { useEffect, useState } from "react";
import api from "@/service/api";
import { Heart, Trash2, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import VariantSelectionModal from "@/components/fashion/VariantSelectionModal";
import SideCartDrawer from "@/components/fashion/SideCartDrawer";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)

  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true) // Mở Drawer giỏ hàng
  }
  const fetchFavorites = async () => {
    try {
      const res = await api.get("/users/favorites");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách yêu thích 💔");
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await api.delete(`/users/favorites/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Đã xóa khỏi danh sách yêu thích 💔");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Heart Button */}
                  <button
                    onClick={() => handleRemoveFavorite(product._id)}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white shadow-lg flex items-center justify-center text-pink-500 hover:text-pink-600 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                    title="Xóa khỏi yêu thích"
                  >
                    <Heart fill="currentColor" className="w-5 h-5" />
                  </button>

                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.sellingPrice && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                      -{Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Name */}
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5em] group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4 mt-auto">
                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {product.sellingPrice.toLocaleString()}₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-xs sm:text-sm">
                        {product.originalPrice.toLocaleString()}₫
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95">
                      <ShoppingCart className="w-4 h-4" />
                      <span onClick={(e) => {
                        // e.preventDefault(); // Có thể cần chặn nếu nút nằm trong thẻ Link
                        setSelectedProduct(product)
                        setIsVariantModalOpen(true)
                      }} className="hidden sm:inline">Thêm vào giỏ</span>
                      <span className="sm:hidden">Giỏ</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(product._id)}
                      className="p-2.5 border-2 border-gray-200 rounded-xl text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:scale-95"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
  );
};

export default Wishlist;