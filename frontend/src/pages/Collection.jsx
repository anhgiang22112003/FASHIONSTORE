import React, { useEffect, useState } from 'react';
import apiUser from '@/service/api';
import SideCartDrawer from '@/components/fashion/SideCartDrawer';
import { Star, ShoppingBag, Heart } from 'lucide-react'
import VariantSelectionModal from '@/components/fashion/VariantSelectionModal';
import { Button } from '@/components/ui/button';


const CollectionPage = () => {
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = React.useState(false)

  const handleSuccessAndOpenCart = () => {
    setIsCartDrawerOpen(true) // Mở Drawer giỏ hàng
  }
  // 🟢 Gọi API khi load trang
  useEffect(() => {
    fetchCollections();
    fetchFeaturedProducts();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await apiUser.get(`/collection`);
      setCollections(res.data.data  || []);
    } catch (err) {
      console.error('Lỗi lấy collection:', err);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const res = await apiUser.get(`/products/featured?featured=true`);
      setFeaturedProducts(res.data);
    } catch (err) {
      console.error('Lỗi lấy sản phẩm nổi bật:', err);
    }
  };

  return (
    <div className="bg-gray-100 font-sans">
      {/* Hero Section */}
      <div
        className="relative w-full h-[60vh] lg:h-[80vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('data:image/jpeg;base64,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')",
        }}
      >
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center text-center">
          <div className="text-white space-y-4">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">Bộ Sưu Tập</h1>
            <p className="text-lg lg:text-xl font-light">
              Khám phá những xu hướng thời trang mới nhất
            </p>
            <button className="mt-4 px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div
              key={collection._id}
              className="bg-gray-50 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-800">{collection.name}</h3>
                <p className="text-sm text-gray-500">
                  {collection.productCount || 0} sản phẩm
                </p>
                <p className="text-gray-600 text-sm">{collection.description}</p>
                <button className="w-full mt-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors">
                  Xem bộ sưu tập
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-pink-50 py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
            <p className="text-gray-600">
              Những món đồ được yêu thích nhất từ các bộ sưu tập
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts?.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
              >
                <div className="relative w-full h-64">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-pink-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c2.4 0 4.23 1.25 5 3.5.77-2.25 2.6-3.5 5-3.5A5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-pink-600 font-bold text-lg">
                      {product.sellingPrice?.toLocaleString()}₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm ml-2">
                        {product.originalPrice.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                  <div 
                  >
                    <Button
                      size="sm"
                      className="w-full bg-pink-500 hover:bg-pink-600"
                      // Thay đổi: Mở modal thay vì thêm trực tiếp
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
              </div>
            ))}
          </div>
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
  );
};

export default CollectionPage;
