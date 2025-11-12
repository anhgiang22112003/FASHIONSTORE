import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '@/service/api'
import Sidebar from '@/components/fashion/SidebarFilterProduct'
import ProductCard from '@/components/fashion/ProductCard'
import { Loader2 } from 'lucide-react'

const CategoryPage = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [category, setCategory] = useState(categoryId || '')
  const [collection, setCollection] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    const fetchCategoriesAndCollections = async () => {
      try {
        const categoriesRes = await api.get('/categories')
        setCategories(categoriesRes?.data?.data || [])
        
        const collectionsRes = await api.get('/collection')
        setCollections(collectionsRes?.data?.data || [])
      } catch (error) {
        toast.error("Lỗi khi lấy danh mục và bộ sưu tập")
      }
    }
    
    fetchCategoriesAndCollections()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/products`, {
          params: {
            category,
            subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
            collection,
            priceRange,
            sortBy,
          },
        })
        setProducts(response.data.products)
      } catch (error) {
        toast.error('Đã xảy ra lỗi khi tải sản phẩm.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, selectedSubcategory, priceRange, collection, sortBy])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <Sidebar
              setSelectedSubcategory={setSelectedSubcategory}
              setPriceRange={setPriceRange}
              categories={categories}
              collections={collections}
              collection={collection}
              setCategory={setCategory}
              setCollection={setCollection}
              setSortBy={setSortBy}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-black text-gray-900">
                  Sản phẩm
                  {products.length > 0 && (
                    <span className="ml-3 text-lg font-normal text-pink-500">
                      ({products.length} sản phẩm)
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-600">
                    Thử thay đổi bộ lọc để tìm sản phẩm phù hợp
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    viewMode="grid"
                    onClick={() => handleProductClick(product._id)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
