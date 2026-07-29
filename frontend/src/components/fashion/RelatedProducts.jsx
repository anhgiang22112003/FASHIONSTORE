import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard' // Giả sử ProductCard nằm trong components
import { Button } from '../ui/button'
import apiUser from '@/service/api'
import { useNavigate } from 'react-router-dom'

const RelatedProducts = ({ productId, title = "Sản phẩm cùng loại", category, collection }) => {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
const navigate = useNavigate()
  // Fetch similar products from the API
  const fetchSimilarProducts = async () => {
    setLoading(true)
    try {
      const response = await apiUser.get(`/products/${productId}/similar`, {
        params: { category, collection },
      })
      
      setRelatedProducts(response.data)
    } catch (err) {
      setError('Không thể tải sản phẩm cùng loại. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch related products when the component mounts or when productId, category, or collection changes
  useEffect(() => {
    fetchSimilarProducts()
  }, [productId, category, collection])

  if (loading) {
    return <div className="text-center">Đang tải...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <section className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button variant="ghost" className="text-pink-500 hover:text-pink-600">
          Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {relatedProducts.length === 0 ? (
        <p className="text-gray-600">Không có sản phẩm cùng loại nào.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {relatedProducts.slice(0, 5).map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              viewMode="grid" 
              onClick={() => navigate(`/product/${product._id}`)} 
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default RelatedProducts
