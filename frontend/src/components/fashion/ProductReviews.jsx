import React, { useState, useEffect, useContext } from 'react'
import { Star, Heart, User, ThumbsUp } from 'lucide-react'
import { Button } from '../ui/button'
import apiUser from '@/service/api'
import { toast } from 'react-toastify'
import { AuthContext } from '@/context/Authcontext'
import apiAdmin from '@/service/apiAdmin'

const ProductReviews = ({ productId }) => {
  const [activeTab, setActiveTab] = useState('reviews')
  const [reviews, setReviews] = useState([])
  const [lovedProducts, setLovedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [ratingFilter, setRatingFilter] = useState('')
  const [replyInputs, setReplyInputs] = useState({})
  const [expandedReplies, setExpandedReplies] = useState({})

  const { user } = useContext(AuthContext)
  const isAdmin = user?.role === 'admin'

  // === Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await apiUser.get(`/reviews/product/${productId}`, {
        params: {
          page: 1,
          limit: 5,
          rating: ratingFilter,
        },
      })
      setReviews(response.data.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, ratingFilter])

  // === Mark helpful
  const handleMarkHelpful = async (reviewId) => {
    try {
      await apiUser.post(`/reviews/${reviewId}/helpful`)
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      )
      toast.success('Bạn đã thích đánh giá này!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thích đánh giá.')
    }
  }

  // === Gửi reply từ user
  const handleUserReply = async (reviewId) => {
    const message = replyInputs[reviewId]?.trim()
    if (!message) return toast.warning('Vui lòng nhập nội dung phản hồi!')

    try {
      await apiUser.patch(`/reviews/${reviewId}/reply-user`, {
        reply: message,
      })
      toast.success('Gửi phản hồi thành công!')
      setReplyInputs({ ...replyInputs, [reviewId]: '' })
      fetchReviews() // Refresh lại để hiển thị reply mới
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi phản hồi thất bại.')
    }
  }
  const handleAdminReply = async (reviewId) => {
    const message = replyInputs[reviewId]?.trim()
    if (!message) return toast.warning('Vui lòng nhập nội dung phản hồi!')

    try {
      await apiAdmin.patch(`/reviews/${reviewId}/reply`, {
        reply: message,
      })
      toast.success('Phản hồi (Admin) đã được gửi!')
      setReplyInputs({ ...replyInputs, [reviewId]: '' })
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi.')
    }
  }


  // === Render sao
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

  // === Render review list
  const renderReviews = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Đánh giá sản phẩm ({reviews.length})</h3>
      {reviews.map((review, index) => (
        <div key={index} className="border-b pb-4 last:border-b-0">
          {/* Người viết review */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">{review.user?.name || 'Ẩn danh'}</span>
            </div>
            {renderStars(review.rating)}
          </div>

          <p className="text-sm text-gray-500 mt-1 mb-2">
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </p>

          <p className="text-gray-700">{review.content}</p>

          {/* === Danh sách phản hồi của admin và user === */}
          {review.replies?.length > 0 && (
            <div
              className={`space-y-2 mt-2 ml-4 overflow-y-auto ${expandedReplies[review._id] ? '' : 'max-h-48'}`}
            >
              {[...review.replies]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((reply, i) => {
                  const isAdmin = reply.senderType === 'admin'
                  const sender = review.replyUsers?.find(u => u._id === reply.senderId)

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-lg ${isAdmin ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isAdmin ? 'text-pink-600' : 'text-gray-700'}`}>
                          {sender?.name || (isAdmin ? 'Admin' : 'Ẩn danh')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{reply.message}</p>
                    </div>
                  )
                })}
            </div>
          )}
          {review.replies?.length > 5 && (
            <button
              onClick={() =>
                setExpandedReplies({
                  ...expandedReplies,
                  [review._id]: !expandedReplies[review._id],
                })
              }
              className="text-sm text-pink-500 hover:underline mt-1"
            >
              {expandedReplies[review._id] ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}


          {/* === Nút like === */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleMarkHelpful(review._id)}
              className="flex items-center gap-1 text-gray-600 hover:text-pink-500"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{review.helpfulCount || 0} lượt thích</span>
            </button>
          </div>

          {/* === Cho user reply lại === */}
          <div className="mt-3 ml-8 space-y-2">
            {isAdmin ? (
              <>
                <textarea
                  placeholder="Phản hồi với tư cách Quản trị viên..."
                  value={replyInputs[review._id] || ''}
                  onChange={(e) =>
                    setReplyInputs({ ...replyInputs, [review._id]: e.target.value })
                  }
                  className="w-full border border-pink-400 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <button
                  onClick={() => handleAdminReply(review._id)}
                  className="mt-1 px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
                >
                  Gửi phản hồi (Admin)
                </button>
              </>
            ) : (
              <>
                <textarea
                  placeholder="Phản hồi lại admin..."
                  value={replyInputs[review._id] || ''}
                  onChange={(e) =>
                    setReplyInputs({ ...replyInputs, [review._id]: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <button
                  onClick={() => handleUserReply(review._id)}
                  className="mt-1 px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  Gửi phản hồi
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      <Button variant="outline" className="mt-4">Xem tất cả đánh giá</Button>
    </div>
  )

  // === Render tab sản phẩm yêu thích
  const renderLovedProducts = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Sản phẩm được yêu thích khác</h3>
      {lovedProducts.map((p) => (
        <div
          key={p._id}
          className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-sm cursor-pointer"
        >
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
      {/* === Tabs === */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'reviews'
            ? 'border-b-2 border-pink-500 text-pink-500'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Đánh giá sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('loved')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'loved'
            ? 'border-b-2 border-pink-500 text-pink-500'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Sản phẩm được yêu thích khác
        </button>
      </div>

      {/* === Nội dung === */}
      <div className="py-4">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải đánh giá...</div>
        ) : (
          <>
            {activeTab === 'reviews' && (
              <div>
                <div className="mb-4">
                  <label className="mr-3">Lọc theo số sao: </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
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
