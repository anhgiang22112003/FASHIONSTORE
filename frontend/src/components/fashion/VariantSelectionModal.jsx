import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react'
import { ShoppingBag, Minus, Plus, Package, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { toast } from 'react-toastify'
import { CartContext } from '@/context/CartContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

const VariantSelectionModal = ({ product, isOpen, onClose, onSuccessAndOpenCart }) => {
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useContext(CartContext)
  const [inputValue, setInputValue] = useState("1");

  useEffect(() => {
    setInputValue(String(quantity))
  }, [quantity])


  // 1. Lấy danh sách Màu và Size duy nhất
  const availableColors = useMemo(() => {
    const colors = new Set(product?.variations?.map(v => v.color))
    return Array.from(colors)
  }, [product])

  const availableSizes = useMemo(() => {
    const filteredVariations = product?.variations?.filter(v => v.color === selectedColor)
    const sizes = new Set(filteredVariations?.map(v => v.size))
    return Array.from(sizes)
  }, [product, selectedColor])

  // 2. Tìm tồn kho hiện tại và Biến thể đã chọn
  const currentVariant = useMemo(() => {
    return product?.variations?.find(v => v.color === selectedColor && v.size === selectedSize)
  }, [product, selectedColor, selectedSize])

  const currentStock = currentVariant?.stock || 0
  const isOutOfStock = currentStock <= 0

  // 3. Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = useCallback(async () => {
    if (!selectedColor || !selectedSize) {
      toast.warning('Vui lòng chọn Màu và Kích thước')
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
      onSuccessAndOpenCart()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Thêm vào giỏ hàng thất bại')
    }
  }, [product, quantity, selectedColor, selectedSize, currentStock, addToCart, onClose, onSuccessAndOpenCart])

  useEffect(() => {
    if (selectedColor && !availableSizes.includes(selectedSize)) {
      setSelectedSize('')
    }
  }, [selectedColor, availableSizes, selectedSize])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[500px] max-h-[88vh] overflow-y-auto p-0 rounded-2xl sm:rounded-3xl border-0 shadow-2xl focus:outline-none">
        {/* Header với gradient */}
        <DialogHeader className="relative p-4 sm:p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white sticky top-0 z-10">
          <div className="absolute inset-0 bg-black/10"></div>
          <DialogTitle className="relative text-xl sm:text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
            Chọn Biến Thể
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-white to-pink-50">
          {/* Product Preview Card */}
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-pink-100">
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
              <img
                src={product?.mainImage}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-1 sm:line-clamp-2 mb-1">
                {product?.name}
              </h3>
              <p className="text-base sm:text-xl font-black text-pink-600">
                {product?.sellingPrice?.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-base font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                Màu sắc
              </p>
              {selectedColor && (
                <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                  {selectedColor}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setQuantity(1)
                  }}
                  className={`px-3.5 py-1.5 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold rounded-full border transition-all duration-200
                    ${selectedColor === color
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          {selectedColor && (
            <div className="space-y-2 sm:space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-base font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                  Kích thước
                </p>
                {selectedSize && (
                  <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                    {selectedSize}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableSizes.map(size => {
                  const variant = product?.variations?.find(v => v.color === selectedColor && v.size === size)
                  const stock = variant?.stock || 0
                  const isDisabled = stock <= 0

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedSize(size)
                          setQuantity(1)
                        }
                      }}
                      disabled={isDisabled}
                      className={`relative px-3.5 py-1.5 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold rounded-full border transition-all duration-200
                        ${selectedSize === size
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md'
                          : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                        }`}
                      title={isDisabled ? 'Hết hàng' : `Còn: ${stock}`}
                    >
                      {isDisabled && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-0.5 bg-gray-400 rotate-45"></span>
                        </span>
                      )}
                      <span className={isDisabled ? 'line-through' : ''}>{size}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          {(selectedColor && selectedSize) && (
            <div className="space-y-3 p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-pink-100 animate-slide-up">
              {/* Stock Info */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Package className={`w-4 h-4 ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`} />
                  <span className="font-medium text-gray-600">Tồn kho:</span>
                </div>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${isOutOfStock
                  ? 'bg-red-100 text-red-600'
                  : currentStock < 10
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                  }`}>
                  {isOutOfStock ? 'Hết hàng' : `${currentStock} sản phẩm`}
                </span>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-gray-800">Số lượng:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-full border-pink-200 hover:bg-pink-50"
                    >
                      <Minus className="w-3.5 h-3.5 text-pink-600" />
                    </Button>

                    <div className="w-12 h-8 flex items-center justify-center">
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
                        className="w-12 h-8 text-center text-sm font-bold text-pink-600 bg-white border border-pink-200 rounded-full focus:outline-none"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(prev => Math.min(currentStock, prev + 1))}
                      disabled={quantity >= currentStock}
                      className="w-8 h-8 rounded-full border-pink-200 hover:bg-pink-50"
                    >
                      <Plus className="w-3.5 h-3.5 text-pink-600" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Add to Cart Button */}
        <div className="p-3 sm:p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-t border-pink-100">
          <Button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize || isOutOfStock || quantity < 1}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm sm:text-base py-4 sm:py-6 font-bold rounded-xl sm:rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isOutOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ Hàng'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VariantSelectionModal