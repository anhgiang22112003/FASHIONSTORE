import api from '@/service/api'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const ProductCategories = () => {
  const [category, setCategory] = React.useState([])

  const Category = async () => {
    try {
      const response = await api.get('/categories')
      const activeCategories = response?.data?.data.filter(item => item.isActive)

      setCategory(activeCategories)
    } catch (error) {
      console.error('Error fetching product categories:', error)
    }
  }
  useEffect(() => {
    Category()
  }, [])
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Danh Mục Sản Phẩm
          </h2>
          <p className="text-xl text-gray-600">
            Tìm kiếm sản phẩm theo từng danh mục phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {category?.map((category) => (
            <div
              key={category?.id}
              className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category?.image}
                  alt={category?.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <Link to={"category"}>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category?.name}
                  </h3>
                  <p className="text-pink-500 font-medium">
                    Sản phẩm liên quan({category?.productCount})
                  </p>
                </div>
              </Link>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-pink-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategories