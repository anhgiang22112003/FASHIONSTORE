import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Minus, Plus, Truck, RefreshCw, Shield } from 'lucide-react'
import { Button } from '../components/ui/button'
import { toast } from 'react-toastify'
import api from '@/service/api'
import { CartContext } from '@/context/CartContext'

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
  const { addToCart } = useContext(CartContext)

  const getProductsDetails = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response?.data)
    } catch (error) {
      toast.error('Lấy chi tiết sản phẩm thất bại')
    }
  }

  useEffect(() => {
    getProductsDetails()
  }, [id])

  // ✅ Khi có sản phẩm => set màu & size mặc định
  useEffect(() => {
    if (product?.variations?.length > 0) {
      const firstColor = product.variations[0].color
      const firstSize = product.variations[0].size
      setSelectedColor(firstColor)
      setSelectedSize(firstSize)
    }
  }, [product])

  // ✅ Lấy tất cả màu có trong variations
  const allColors = [...new Set(product?.variations?.map((v) => v.color) || [])]

  // ✅ Lấy tất cả size có trong variations
  const allSizes = [...new Set(product?.variations?.map((v) => v.size) || [])]

  // ✅ Chỉ lấy size có tồn tại trong màu hiện tại
  const availableSizes = product?.variations
    ?.filter((v) => v.color === selectedColor)
    ?.map((v) => v.size) || []

  // ✅ Khi đổi màu: nếu size hiện tại không tồn tại trong màu mới -> tự động nhảy sang size đầu tiên có sẵn
  useEffect(() => {
    if (selectedColor && availableSizes.length > 0) {
      if (!availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0])
      }
    }
  }, [selectedColor])

  // ✅ Cập nhật tồn kho khi đổi màu hoặc size
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
        <Button onClick={() => navigate('/')}>Về trang chủ</Button>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.warning('Vui lòng chọn màu và kích thước')
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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <span className="cursor-pointer hover:text-pink-500" onClick={() => navigate('/')}>
          Trang chủ
        </span>
        <span className="mx-2">/</span>
        <span className="cursor-pointer hover:text-pink-500">{product?.category?.name}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product?.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product?.subImages?.[selectedImage] || product?.mainImage}
              alt={product?.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product?.subImages?.length > 1 && (
            <div className="flex gap-4">
              {product?.subImages?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-pink-500' : 'border-gray-200'
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product?.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-pink-500">
                {product?.sellingPrice?.toLocaleString('vi-VN')}đ
              </span>
              {product?.discount > 0 && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {product?.originalPrice?.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-green-600 text-sm font-semibold">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* ✅ Tồn kho */}
            <div className="flex items-center gap-6 text-gray-700 mb-4">
              <span>
                <strong>Tồn kho:</strong> {currentStock || 0} sản phẩm
              </span>
              <span>
                <strong>Đã bán:</strong> {product?.soldCount ?? 0} sản phẩm
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed">{product?.detailedDescription}</p>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Màu sắc: {selectedColor}</h3>
            <div className="flex gap-2 flex-wrap">
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border rounded-lg ${selectedColor === color
                    ? 'border-pink-500 bg-pink-50 text-pink-500'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Size Selection (ẩn size không có trong màu hiện tại) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kích thước: {selectedSize}</h3>
            <div className="flex gap-2 flex-wrap">
              {allSizes.map((size) => {
                const isAvailable = availableSizes.includes(size)
                if (!isAvailable) return null // 👉 ẩn luôn size không có
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg ${selectedSize === size
                      ? 'border-pink-500 bg-pink-50 text-pink-500'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Số lượng</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-green-600">{product.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
              size="lg"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <Button
              onClick={() => setIsLiked(!isLiked)}
              variant="outline"
              size="lg"
              className={isLiked ? 'text-pink-500 border-pink-500' : ''}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-sm">Miễn phí vận chuyển</p>
            </div>
            <div className="text-center">
              <RefreshCw className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-sm">Đổi trả 30 ngày</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-sm">Bảo hành chất lượng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
