import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '@/service/api'
import Sidebar from '@/components/fashion/SidebarFilterProduct'
import ProductCard from '@/components/fashion/ProductCard'

const CategoryPage = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [category, setCategory] = useState(categoryId || '')  // Default to the category in URL
  const [collection, setCollection] = useState('')  // for collection filter
  const [sortBy, setSortBy] = useState('newest') // Default sort by newest

  const [categories, setCategories] = useState([])  // List of categories from backend
  const [collections, setCollections] = useState([])  // List of collections from backend

  useEffect(() => {
    // Fetch categories and collections when the component mounts
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
            sortBy,  // Add sortBy filter
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
  }, [category, selectedSubcategory, priceRange, collection, sortBy])  // Watch for sortBy filter change

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="container mx-auto p-6 flex gap-12">
      <Sidebar
        setSelectedSubcategory={setSelectedSubcategory}
        setPriceRange={setPriceRange}
        categories={categories}
        collections={collections}
        setCategory={setCategory}
        setCollection={setCollection}
        setSortBy={setSortBy}  // Pass setSortBy to Sidebar
      />

      <div className="flex-1">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm</h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            products?.map((product) => (
              <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product._id)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
