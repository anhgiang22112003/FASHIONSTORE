import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Minus, Plus, Truck, RefreshCw, Shield, Star } from 'lucide-react'
import { Button } from '../components/ui/button'
import { toast } from 'react-toastify'
import api from '@/service/api'
import { CartContext } from '@/context/CartContext'
import RelatedProducts from '@/components/fashion/RelatedProducts'
import ProductReviews from '@/components/fashion/ProductReviews'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/Authcontext'

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
  const [favorites, setFavorites] = React.useState([])
  const { user } = useContext(AuthContext)

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
      setCurrentStock(variant?.stock ?? 0)
    }
  }, [selectedColor, selectedSize, product])

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
        </div>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <span
            className="cursor-pointer hover:text-pink-500 transition-colors"
            onClick={() => navigate('/')}
          >
            Trang chủ
          </span>
          <span className="text-border">/</span>
          <span
            className="cursor-pointer hover:text-pink-500 transition-colors"
          >
            {product?.category?.name}
          </span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">{product?.name}</span>
        </nav>

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
                src={product?.mainImage}
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
            {product?.subImages?.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {product?.subImages?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index)
                      setImageLoading(true)
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                Kích thước: <span className="text-pink-500">{selectedSize}</span>
              </h3>
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
                  <span className="px-8 py-3 font-semibold text-lg min-w-[80px] text-center">
                    {quantity}
                  </span>
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
    </div>
  )
}

export default ProductPage
