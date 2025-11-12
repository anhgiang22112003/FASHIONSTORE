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
  const [showReplyForm, setShowReplyForm] = useState({})

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
    <div className="flex items-center gap-1">
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-pink-500 text-foreground">
          Đánh giá sản phẩm ({reviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Lọc theo:</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả</option>
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>{star} sao</option>
            ))}
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có đánh giá nào cho sản phẩm này
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="border-b border-border pb-6 last:border-b-0">
            {/* Header: User info + Rating */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-pink-500 text-foreground">
                    {review.user?.name || 'Ẩn danh'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            {/* Review content */}
            <p className="text-sm text-foreground leading-relaxed mb-3">{review.content}</p>

            {/* === Danh sách phản hồi của admin và user === */}
            {review.replies?.length > 0 && (
              <div className="ml-12 space-y-2 mb-3">
                <div
                  className={`space-y-2 overflow-y-auto ${
                    expandedReplies[review._id] ? '' : 'max-h-48'
                  }`}
                >
                  {[...review.replies]
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map((reply, i) => {
                      const isAdminReply = reply.senderType === 'admin'
                      const sender = review.replyUsers?.find((u) => u._id === reply.senderId)

                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg text-sm ${
                            isAdminReply
                              ? 'bg-pink-50 border border-pink-200'
                              : 'bg-muted border border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`font-semibold text-xs ${
                                isAdminReply ? 'text-pink-600' : 'text-foreground'
                              }`}
                            >
                              {sender?.name || (isAdminReply ? '👑 Quản trị viên' : 'Ẩn danh')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-foreground">{reply.message}</p>
                        </div>
                      )
                    })}
                </div>
                {review.replies?.length > 3 && (
                  <button
                    onClick={() =>
                      setExpandedReplies({
                        ...expandedReplies,
                        [review._id]: !expandedReplies[review._id],
                      })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    {expandedReplies[review._id] ? '← Thu gọn' : `Xem thêm ${review.replies.length - 3} phản hồi →`}
                  </button>
                )}
              </div>
            )}

            {/* === Action buttons: Helpful + Reply === */}
            <div className="flex items-center gap-4 ml-12">
              <button
                onClick={() => handleMarkHelpful(review._id)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Hữu ích ({review.helpfulCount || 0})</span>
              </button>
              <button
                onClick={() =>
                  setShowReplyForm({ ...showReplyForm, [review._id]: !showReplyForm[review._id] })
                }
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Trả lời
              </button>
            </div>

            {/* === Form reply (chỉ hiện khi bấm "Trả lời") === */}
            {showReplyForm[review._id] && (
              <div className="mt-4 ml-12 bg-muted/50 p-4 rounded-lg border border-border">
                {isAdmin ? (
                  <>
                    <textarea
                      placeholder="Phản hồi với tư cách Quản trị viên..."
                      value={replyInputs[review._id] || ''}
                      onChange={(e) =>
                        setReplyInputs({ ...replyInputs, [review._id]: e.target.value })
                      }
                      className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          handleAdminReply(review._id)
                          setShowReplyForm({ ...showReplyForm, [review._id]: false })
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                      >
                        Gửi phản hồi
                      </Button>
                      <Button
                        onClick={() => setShowReplyForm({ ...showReplyForm, [review._id]: false })}
                        variant="outline"
                        size="sm"
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <textarea
                      placeholder="Nhập phản hồi của bạn..."
                      value={replyInputs[review._id] || ''}
                      onChange={(e) =>
                        setReplyInputs({ ...replyInputs, [review._id]: e.target.value })
                      }
                      className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          handleUserReply(review._id)
                          setShowReplyForm({ ...showReplyForm, [review._id]: false })
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                      >
                        Gửi
                      </Button>
                      <Button
                        onClick={() => setShowReplyForm({ ...showReplyForm, [review._id]: false })}
                        variant="outline"
                        size="sm"
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {reviews.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Xem tất cả đánh giá
          </Button>
        </div>
      )}
    </div>
  )

  // === Render tab sản phẩm yêu thích
  const renderLovedProducts = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground mb-6">
        Sản phẩm được yêu thích khác
      </h3>
      {lovedProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có sản phẩm yêu thích nào
        </div>
      ) : (
        lovedProducts.map((p) => (
          <div
            key={p._id}
            className="flex items-center gap-4 p-4 border border-border rounded-lg hover:shadow-md hover:border-primary transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={p.mainImage}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {p.name}
              </p>
              <p className="text-sm font-bold text-primary mt-1">
                {p.sellingPrice.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20 flex-shrink-0" />
          </div>
        ))
      )}
    </div>
  )

  return (
    <section className="mt-12 bg-background rounded-lg border border-border p-6">
      {/* === Tabs === */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'reviews'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Đánh giá sản phẩm
          {activeTab === 'reviews' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('loved')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'loved'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sản phẩm được yêu thích khác
          {activeTab === 'loved' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* === Nội dung === */}
      <div className="py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground mt-3">Đang tải...</p>
          </div>
        ) : (
          <>
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'loved' && renderLovedProducts()}
          </>
        )}
      </div>
    </section>
  )
}

export default ProductReviews
