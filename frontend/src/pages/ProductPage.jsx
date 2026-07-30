import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Minus, Plus, Truck, RefreshCw, Shield, Star, Ruler, Scale, Share2, Copy } from 'lucide-react'
import { Button } from '../components/ui/button'
import { toast } from 'react-toastify'
import api from '@/service/api'
import { CartContext } from '@/context/CartContext'
import RelatedProducts from '@/components/fashion/RelatedProducts'
import ProductReviews from '@/components/fashion/ProductReviews'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/AuthContext'
import { CompareContext } from '@/context/CompareContext'
import Breadcrumb from '@/components/fashion/Breadcrumb'
import SizeGuideModal from '@/components/fashion/SizeGuideModal'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [currentStock, setCurrentStock] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const { addToCart } = useContext(CartContext)
  const { fetchWishlist } = useContext(WishlistContext)
  const { addToCompare } = useContext(CompareContext)
  const [favorites, setFavorites] = React.useState([])
  const { user } = useContext(AuthContext)
  const [inputValue, setInputValue] = useState("1");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết sản phẩm 📋');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const getProductsDetails = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response?.data)
    } catch (error) {
      toast.error('Lấy chi tiết sản phẩm thất bại')
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
    if (user) {
      getFavorites()
    }
  }, [user])


  useEffect(() => {
    getProductsDetails()
  }, [id])

  useEffect(() => {
    if (product?.variations?.length > 0) {
      const firstColor = product.variations[0].color
      const firstSize = product.variations[0].size
      setSelectedColor(firstColor)
      setSelectedSize(firstSize)
    }
  }, [product])

  const allImages = React.useMemo(() => {
    if (!product) return []
    const list = []
    if (product.mainImage) list.push(product.mainImage)
    if (product.subImages && Array.isArray(product.subImages)) {
      list.push(...product.subImages)
    }
    return list
  }, [product])

  const allColors = [...new Set(product?.variations?.map((v) => v.color) || [])]
  const allSizes = [...new Set(product?.variations?.map((v) => v.size) || [])]

  const availableSizes = product?.variations
    ?.filter((v) => v.color === selectedColor)
    ?.map((v) => v.size) || []

  useEffect(() => {
    if (selectedColor && availableSizes.length > 0) {
      if (!availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0])
      }
    }
  }, [selectedColor])

  useEffect(() => {
    if (product?.variations && selectedColor && selectedSize) {
      const variant = product.variations.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      )
      setCurrentStock((variant?.stock ?? 0) - (variant?.lockedStock ?? 0))
    }
  }, [selectedColor, selectedSize, product])

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-2 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-2 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-40 rounded-full bg-gray-200 animate-pulse" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Left: Image skeleton */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>

            {/* Right: Info skeleton */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <div className="h-9 w-4/5 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-9 w-3/5 rounded-xl bg-gray-200 animate-pulse" />
                {/* Stars */}
                <div className="flex items-center gap-2 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
                  ))}
                  <div className="h-4 w-24 rounded-full bg-gray-200 animate-pulse ml-2" />
                </div>
              </div>

              {/* Price box */}
              <div className="bg-gray-100 rounded-2xl p-6 space-y-3 animate-pulse">
                <div className="h-10 w-48 rounded-xl bg-gray-200" />
                <div className="flex gap-4">
                  <div className="h-4 w-32 rounded-full bg-gray-200" />
                  <div className="h-4 w-24 rounded-full bg-gray-200" />
                </div>
              </div>

              {/* Description box */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-2 animate-pulse">
                <div className="h-5 w-36 rounded-full bg-gray-200" />
                <div className="h-4 w-full rounded-full bg-gray-200" />
                <div className="h-4 w-5/6 rounded-full bg-gray-200" />
                <div className="h-4 w-4/6 rounded-full bg-gray-200" />
              </div>

              {/* Color */}
              <div className="space-y-3">
                <div className="h-5 w-32 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-11 w-20 rounded-xl bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-3">
                <div className="h-5 w-28 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-11 w-16 rounded-xl bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <div className="flex-1 h-14 rounded-xl bg-gray-200 animate-pulse" />
                <div className="flex-1 h-14 rounded-xl bg-pink-200 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
                    <div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-14 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related products skeleton */}
          <div className="space-y-6">
            <div className="h-7 w-64 rounded-xl bg-gray-200 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 w-1/2 rounded bg-pink-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    )
  }


  const handleBuyNow = async () => {
    if (!selectedColor || !selectedSize) {
      toast.warning('Vui lòng chọn màu và kích thước')
      return
    }

    if (quantity > currentStock) {
      toast.warning(`Không đủ hàng, chỉ còn ${currentStock} sản phẩm.`)
      return
    }

    const res = await api.get(`/products/${id}`)
    const product = res.data
    navigate("/checkout", {
      state: {
        mode: "buyNow",
        product,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
      },
    })
  }

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.warning('Vui lòng chọn màu và kích thước')
      return
    }

    if (quantity > currentStock) {
      toast.warning(`Không đủ hàng, chỉ còn ${currentStock} sản phẩm.`)
      return
    }

    if (!product?._id) {
      toast.error('Không tìm thấy sản phẩm')
      return
    }

    try {
      const body = {
        productId: product._id,
        quantity,
        color: selectedColor,
        size: selectedSize,
      }
      await addToCart(body)
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Thêm vào giỏ hàng thất bại')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: product?.category?.name || 'Thời trang', path: `/products` },
              { label: product?.name || 'Chi tiết sản phẩm' }
            ]}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-card group">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                </div>
              )}
              <img
                key={selectedImage}
                src={allImages[selectedImage] || product?.mainImage}
                alt={product?.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onLoad={() => setImageLoading(false)}
              />
              {product?.discount > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  -{product.discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (selectedImage !== index) {
                        setSelectedImage(index)
                        setImageLoading(true)
                      }
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                      ? 'border-pink-500 shadow-product scale-95'
                      : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product?.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
                {product?.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product?.ratingAverage || 0)
                        ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">({product?.reviewCount} đánh giá)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  {product?.sellingPrice?.toLocaleString('vi-VN')}đ
                </span>
                {product?.discount > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product?.originalPrice?.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mt-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <strong>Tồn kho:</strong> {currentStock || 0} sản phẩm
                </span>
                <span>
                  <strong>Đã bán:</strong> {product?.soldCount ?? 0}+
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                Mô tả sản phẩm
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product?.detailedDescription}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                Màu sắc: <span className="text-pink-500">{selectedColor}</span>
              </h3>
              <div className="flex gap-3 flex-wrap">
                {allColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-300 ${selectedColor === color
                      ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-500 shadow-product scale-105'
                      : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                  Kích thước: <span className="text-pink-500">{selectedSize}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  <Ruler className="w-4 h-4" /> Bảng quy đổi size
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {allSizes.map((size) => {
                  const isAvailable = availableSizes.includes(size)
                  if (!isAvailable) return null
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-300 min-w-[80px] ${selectedSize === size
                        ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-500 shadow-product scale-105'
                        : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                        } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                Số lượng
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setInputValue(val);
                      }
                    }}
                    onBlur={() => {
                      let num = parseInt(inputValue);
                      if (isNaN(num) || num < 1) num = 1;
                      if (num > currentStock) num = currentStock;
                      setQuantity(num);
                      setInputValue(String(num));
                    }}
                    className="px-6 py-3 font-semibold text-lg w-20 text-center outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-3 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={quantity >= currentStock}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className={`font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentStock > 0 ? product.status : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 transition-all duration-300 h-14 text-base font-semibold rounded-xl shadow-md hover:shadow-product"
                disabled={currentStock === 0 || quantity > currentStock}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button>

              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all duration-300 h-14 text-base font-semibold rounded-xl shadow-product hover:shadow-xl hover:scale-105"
                disabled={currentStock === 0 || quantity > currentStock}
              >
                Mua ngay
              </Button>

              <Button
                size="sm"
                className={`w-12 h-12 p-0 rounded-full shadow-xl ${favorites.includes(product._id)
                  ? 'bg-gradient-to-r from-pink-400 to-pink-600'
                  : 'bg-white hover:bg-gray-50'
                  }`}
                onClick={(e) => {
                  e.preventDefault()
                  toggleFavorite(product._id)
                }}
              >
                <Heart
                  className={`w-5 h-5 ${favorites.includes(product._id)
                    ? 'fill-white text-white'
                    : 'text-black'
                    }`}
                />
              </Button>
            </div>

            {/* Secondary Actions: Compare & Share */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => addToCompare(product)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors"
              >
                <Scale className="w-4 h-4 text-pink-500" /> So sánh sản phẩm
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> Chia sẻ:
                </span>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                  title="Chia sẻ Facebook"
                >
                  FB
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  title="Sao chép link"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy link
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-product transition-all duration-300">
                  <Truck className="w-7 h-7 text-pink-500" />
                </div>
                <p className="text-sm font-medium text-foreground">Miễn phí vận chuyển</p>
                <p className="text-xs text-muted-foreground mt-1">Đơn từ 500k</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-product transition-all duration-300">
                  <RefreshCw className="w-7 h-7 text-pink-500" />
                </div>
                <p className="text-sm font-medium text-foreground">Đổi trả 30 ngày</p>
                <p className="text-xs text-muted-foreground mt-1">Miễn phí</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-product transition-all duration-300">
                  <Shield className="w-7 h-7 text-pink-500" />
                </div>
                <p className="text-sm font-medium text-foreground">Bảo hành chính hãng</p>
                <p className="text-xs text-muted-foreground mt-1">12 tháng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products & Reviews */}
        <div className="space-y-16">
          <RelatedProducts
            title={`Sản phẩm cùng danh mục: ${product?.category?.name || '...'}`}
            category={product.category._id}
            collection={product.collection._id}
            productId={id}
          />

          <div className="border-t border-gray-200"></div>

          <ProductReviews productId={id} />
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  )
}

export default ProductPage
