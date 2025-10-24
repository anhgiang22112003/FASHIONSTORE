import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Star, Heart, User, ThumbsUp } from 'lucide-react'
import { Button } from '../ui/button'
import apiUser from '@/service/api'
import { toast } from 'react-toastify'

const ProductReviews = ({ productId }) => {
  const [activeTab, setActiveTab] = useState('reviews')
  const [reviews, setReviews] = useState([])
  const [lovedProducts, setLovedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [ratingFilter, setRatingFilter] = useState('')  // Rating filter state

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true)
      setTimeout(async () => {
        const response = await apiUser.get(`/reviews/product/${productId}`, {
          params: {
            page: 1,
            limit: 5,
            rating: ratingFilter, // Add the rating filter to the request
          },
        })
        setReviews(response.data.data)
        setLoading(false)
      }, 500) // Simulate a 500ms loading delay
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setLoading(false)
    }
  }

  // Fetch loved products (if you have an endpoint for that)
  // const fetchLovedProducts = async () => {
  //   try {
  //     setLoading(true)
  //     const response = await axios.get('/api/products/loved') // Adjust API endpoint as per your backend
  //     setLovedProducts(response.data)
  //     setLoading(false)
  //   } catch (error) {
  //     console.error("Error fetching loved products:", error)
  //     setLoading(false)
  //   }
  // }

  const handleMarkHelpful = async (reviewId) => {
    try {
      await apiUser.post(`/reviews/${reviewId}/helpful`)
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        )
      )
      toast.success("You liked this review!")
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  // Update the rating filter when the user selects a different rating
  const handleRatingFilterChange = (e) => {
    setRatingFilter(e.target.value)
  }

  // Use useEffect to call the API when the component mounts
  useEffect(() => {
    fetchReviews()
    // fetchLovedProducts()
  }, [productId,ratingFilter])  // Fetch reviews when ratingFilter changes
 
  const renderStars = (rating) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const renderReviews = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Đánh giá sản phẩm ({reviews.length})</h3>
      {reviews.map((review, index) => (
        <div key={index} className="border-b pb-4 last:border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">{review.user.name}</span>
            </div>
            {renderStars(review.rating)}
          </div>
          <p className="text-sm text-gray-500 mt-1 mb-2">{new Date(review.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-700">{review.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleMarkHelpful(review._id)}
              className="flex items-center gap-1 text-gray-600 hover:text-pink-500"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{review.helpfulCount || 0} Lượt thích</span>
            </button>
          </div>
        </div>
      ))}
      <Button variant="outline">Xem tất cả đánh giá</Button>
    </div>
  )

  const renderLovedProducts = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Sản phẩm được yêu thích khác</h3>
      {lovedProducts.map((p) => (
        <div key={p._id} className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-sm cursor-pointer">
          <div className="w-16 h-16 flex-shrink-0">
            <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover rounded" />
          </div>
          <div className="flex-1">
            <p className="font-medium hover:text-pink-500 line-clamp-2">{p.name}</p>
            <p className="text-sm font-bold text-pink-500">
              {p.sellingPrice.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500/10 flex-shrink-0" />
        </div>
      ))}
    </div>
  )

  return (
    <section className="mt-12">
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'reviews'
            ? 'border-b-2 border-pink-500 text-pink-500'
            : 'text-gray-600 hover:text-gray-800'}`}
        >
          Đánh giá sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('loved')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'loved'
            ? 'border-b-2 border-pink-500 text-pink-500'
            : 'text-gray-600 hover:text-gray-800'}`}
        >
          Sản phẩm được yêu thích khác
        </button>
      </div>

      <div className="py-4">
        {loading ? (
         <div className="text-center">
        {/* Spinner HTML/CSS Goes Here */}
        <div className="spinner"></div> 
        {/* You can optionally keep text or make the spinner larger instead */}
        {/* <span className="sr-only">Đang tải...</span> */} 
    </div>
        ) : (
          <>
            {activeTab === 'reviews' && (
              <div>
                {/* Rating Filter UI */}
                <div className="mb-4">
                  <label className="mr-3">Lọc theo số sao: </label>
                  <select
                    value={ratingFilter}
                    onChange={handleRatingFilterChange}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Tất cả</option>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <option key={star} value={star}>{`${star} sao`}</option>
                    ))}
                  </select>
                </div>
                {renderReviews()}
              </div>
            )}
            {activeTab === 'loved' && renderLovedProducts()}
          </>
        )}
      </div>
    </section>
  )
}

export default ProductReviews
