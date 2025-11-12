import React, { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import apiUser from '@/service/api';
import SideCartDrawer from '@/components/fashion/SideCartDrawer';
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp, Package } from 'lucide-react';
import VariantSelectionModal from '@/components/fashion/VariantSelectionModal';
import { Button } from '@/components/ui/button';
import { WishlistContext } from '@/context/WishlistContext';
import { AuthContext } from '@/context/Authcontext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

// Collection Card Component - Memoized
const CollectionCard = React.memo(({ collection, index }) => {
  return (
    <div
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Collection Image */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Product Count Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-pink-600 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
          <Package className="w-4 h-4" />
          {collection.productCount || 0} sản phẩm
        </div>

        {/* Collection Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl font-black mb-2">{collection.name}</h3>
          <p className="text-sm text-white/90 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {collection.description}
          </p>
        </div>
      </div>

      {/* Collection Info */}
      <div className="p-6 bg-gradient-to-br from-white to-pink-50">
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold rounded-full shadow-xl hover:shadow-pink-500/50 transform group-hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Xem bộ sưu tập
        </Button>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
    </div>
  );
});

CollectionCard.displayName = 'CollectionCard';

// Product Card Component - Memoized (giống BestSellers)
const ProductCard = React.memo(({ product, index, favorites, onToggleFavorite, onAddToCart }) => {
  const isFavorite = favorites.includes(product._id);
  
  return (
    <div
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Product Image */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Sale Badge */}
        {product.originalPrice > product.sellingPrice && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-400 to-pink-600 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg animate-bounce-in">
            -{Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Featured Badge */}
        <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-pulse">
          <Sparkles className="w-3 h-3" />
          NỔI BẬT
        </div>

        {/* Action Buttons */}
        <div className="absolute top-20 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <Button
            size="sm"
            className={`w-12 h-12 p-0 rounded-full shadow-xl ${
              isFavorite
                ? 'bg-gradient-to-r from-pink-400 to-pink-600'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(product._id);
            }}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-white text-white' : 'text-black'
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
              e.preventDefault();
              onAddToCart(product);
            }}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 bg-white">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-black mb-3 line-clamp-2 text-lg group-hover:text-pink-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.ratingAverage || 0)
                    ? 'text-pink-500 fill-pink-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-semibold">
            {product.ratingAverage?.toFixed(1) ?? 0} ({product.reviewCount ?? 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
            {product.sellingPrice?.toLocaleString('vi-VN')}₫
          </span>
          {product.originalPrice > product.sellingPrice && (
            <span className="text-sm text-gray-500 line-through font-medium">
              {product.originalPrice?.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Main Component
const CollectionPage = () => {
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  const { fetchWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const handleSuccessAndOpenCart = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await apiUser.get('/collection');
      setCollections(res.data.data || []);
    } catch (err) {
      console.error('Lỗi lấy collection:', err);
      toast.error('Không thể tải bộ sưu tập');
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const res = await apiUser.get('/products/featured?featured=true');
      setFeaturedProducts(res.data);
    } catch (err) {
      console.error('Lỗi lấy sản phẩm nổi bật:', err);
      toast.error('Không thể tải sản phẩm nổi bật');
    }
  }, []);

  const getFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiUser.get('/users/favorites');
      const ids = (res.data || []).map((p) => p._id ?? p.id);
      setFavorites(ids);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [user]);

  const toggleFavorite = useCallback(async (productId) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    try {
      const already = favorites.includes(productId);
      setFavorites(prev => already ? prev.filter(id => id !== productId) : [...prev, productId]);
      
      if (already) {
        await apiUser.delete(`/users/favorites/${productId}`);
        toast.info('Đã xóa khỏi danh sách yêu thích 💔');
      } else {
        await apiUser.post(`/users/favorites/${productId}`, {});
        toast.success('Đã thêm vào danh sách yêu thích ❤️');
      }
      
      fetchWishlist();
      await getFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
      await getFavorites();
    }
  }, [favorites, user, fetchWishlist, getFavorites]);

  const handleAddToCart = useCallback((product) => {
    setSelectedProduct(product);
    setIsVariantModalOpen(true);
  }, []);

  useEffect(() => {
    fetchCollections();
    fetchFeaturedProducts();
  }, [fetchCollections, fetchFeaturedProducts]);

  useEffect(() => {
    if (user) {
      getFavorites();
    }
  }, [user, getFavorites]);

  // Memoize collection list
  const collectionList = useMemo(() => {
    return collections.map((collection, index) => (
      <CollectionCard
        key={collection._id}
        collection={collection}
        index={index}
      />
    ));
  }, [collections]);

  // Memoize product list
  const productList = useMemo(() => {
    return featuredProducts.map((product, index) => (
      <ProductCard
        key={product._id}
        product={product}
        index={index}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onAddToCart={handleAddToCart}
      />
    ));
  }, [featuredProducts, favorites, toggleFavorite, handleAddToCart]);

  return (
    <div className="bg-gradient-to-b from-pink-50 to-white font-sans">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700"
          style={{
            backgroundImage:
              "url('data:image/jpeg;base64,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')",
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-bold">COLLECTIONS 2024</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                Bộ Sưu Tập
                <br />
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Thời Trang
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl font-light text-white/90">
                Khám phá những xu hướng thời trang mới nhất và phong cách độc đáo
              </p>
              
              <Button
                size="lg"
                className="mt-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full px-8 py-6 text-lg shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Khám phá ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-50 to-transparent"></div>
      </div>

      {/* Collection Grid Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full border border-pink-300 mb-4">
              <TrendingUp className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-bold text-pink-600">BỘ SƯU TẬP</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black mb-6 text-black">
              Khám Phá <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Bộ Sưu Tập</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những bộ sưu tập được tuyển chọn kỹ lưỡng với phong cách độc đáo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collectionList}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-[#FFF5F7] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-pink-300 mb-4 shadow-lg">
              <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
              <span className="text-sm font-bold text-black">FEATURED PRODUCTS</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black mb-6 text-black">
              Sản Phẩm <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Nổi Bật</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những món đồ được yêu thích nhất từ các bộ sưu tập
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {productList}
          </div>

          <div className="text-center mt-16 animate-slide-up">
            <Link to="/products">
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
      </section>

      {/* Modals and Drawers */}
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