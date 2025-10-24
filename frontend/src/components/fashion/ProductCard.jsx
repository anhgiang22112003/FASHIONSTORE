// components/ProductCard.js
import { useState } from 'react'
import { Star, Heart } from 'lucide-react'
import { Button } from '../ui/button'

const ProductCard = ({ product, viewMode, onClick }) => {
  const [isLiked, setIsLiked] = useState(false)

  const price = product?.sellingPrice || 0 
  const originalPrice = product?.originalPrice || 0 
  const rating = 4 
  const reviews = 42 
  
  const discountPercentage = 
    originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null
  
  if (viewMode === 'list') {
    return (
      <div className="flex gap-6 bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={product?.mainImage}
            alt={product?.name}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={onClick}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-500" onClick={onClick}>
            {product?.name}
          </h3>
          {/* Sử dụng shortDescription từ dữ liệu */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product?.shortDescription}</p>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) // Sử dụng rating giả lập
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            {/* Sử dụng reviews giả lập */}
            <span className="text-sm text-gray-600">({reviews})</span> 
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-pink-500">
                {price?.toLocaleString('vi-VN')}đ {/* Sử dụng giá bán thực tế (sellingPrice) */}
              </span>
              {/* Chỉ hiển thị giá gốc nếu giá bán thực tế thấp hơn giá gốc */}
              {originalPrice > price && (
                <span className="text-sm text-gray-500 line-through">
                  {originalPrice?.toLocaleString('vi-VN')}đ 
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className={isLiked ? 'text-pink-500 border-pink-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden rounded-t-lg relative">
        <img
          src={product?.mainImage}
          alt={product?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
          onClick={onClick}
        />

        {/* Hiển thị phần trăm giảm giá nếu có */}
        {discountPercentage && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLiked ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-pink-50'
            }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-500" onClick={onClick}>
          {product?.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) // Sử dụng rating giả lập
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
                }`}
            />
          ))}
          {/* Sử dụng reviews giả lập */}
          <span className="text-xs text-gray-600 ml-1">({reviews})</span> 
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-pink-500">
            {price?.toLocaleString('vi-VN')}đ {/* Sử dụng giá bán thực tế (sellingPrice) */}
          </span>
          {/* Chỉ hiển thị giá gốc nếu giá bán thực tế thấp hơn giá gốc */}
          {originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {originalPrice?.toLocaleString('vi-VN')}đ 
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard